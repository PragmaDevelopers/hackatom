"use client";

import '@solana/wallet-adapter-react-ui/styles.css';
import React, { useState, useRef, useEffect, createContext, useContext, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet as WalletIcon, CheckIcon, CopyIcon } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage
} from "@/components/ui/form";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { getProgram, IDLPrograms } from "@/utils/anchorConfig";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Switch } from '@/components/ui/switch';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { createMint } from "@solana/spl-token";
import { useTabLayoutContext } from '../contexts/TabLayoutContext';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddBotPage(): ReactNode {
    const { publicKey, signTransaction, signAllTransactions, wallet } = useWallet();
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const { tabLayoutContextState, setTabLayoutContextState } = useTabLayoutContext();
    const { localState, shareState } = tabLayoutContextState;

    // Form schema definition
    const formAddBotSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        prefix: z.string().min(2, { message: "Prefix must be at least 2 characters." }),
        fee_withdraw_network: z.coerce.number().min(0, { message: "Fee can't be lower than 0." }),
        fee_account: z.string().min(2, { message: "Fee account must be at least 2 characters." }),
    });

    // Define form with Zod validation
    const formAddBot = useForm<z.infer<typeof formAddBotSchema>>({
        resolver: zodResolver(formAddBotSchema),
        defaultValues: {
            name: "",
            prefix: "",
            fee_withdraw_network: 0,
            fee_account: "",
        },
    });

    // Form schema definition
    const formGetBotSchema = z.object({
        contract_address: z.string().min(2, { message: "Fee account must be at least 2 characters." }),
    });

    // Define form with Zod validation
    const formGetBot = useForm<z.infer<typeof formGetBotSchema>>({
        resolver: zodResolver(formGetBotSchema),
        defaultValues: {
            contract_address: "",
        },
    });

    const onSubmitAddBot = async (values: z.infer<typeof formAddBotSchema>) => {
        setIsSubmittingForm(true);
        setTabLayoutContextState({
            ...tabLayoutContextState,
            error: null,
            isSubmitting: true
        });

        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }

            // Set user data (wallet and public key)
            shareState.userData.wallet = wallet;
            shareState.userData.publicKey = publicKey;

            const factoryProgram = getProgram({ publicKey, signTransaction, signAllTransactions }, IDLPrograms.factory);
            const contractAddress = anchor.web3.Keypair.generate().publicKey;
            shareState.contractAddress = contractAddress;

            // Derive PDA for the bot account
            const [botPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("bot"), contractAddress.toBuffer()],
                factoryProgram.programId
            );
            shareState.botPda = botPda;

            console.log("Contract address:", contractAddress.toString());
            console.log("Bot PDA:", botPda.toString());

            // Create the fee account PublicKey from the input string
            let feeAccount: PublicKey;

            try {
                feeAccount = new PublicKey(values.fee_account);
                shareState.feeCollectorNetworkAddress = feeAccount;
            } catch (err) {
                throw new Error("Invalid fee account address");
            }

            // Submit transaction to add bot
            const result = await factoryProgram.methods
                .addBot(
                    values.name,
                    values.prefix,
                    publicKey, // Owner
                    publicKey, // Void Collector 1
                    publicKey, // Void Collector 2
                    publicKey, // Void Collector 3
                    publicKey, // Void Collector 4
                    contractAddress,
                    PublicKey.default, // strategy
                    PublicKey.default, // subaccount
                    PublicKey.default, // payments
                    PublicKey.default, // token
                    new BN(values.fee_withdraw_network),
                    feeAccount,
                )
                .accounts({
                    managerAddress: contractAddress,
                    signer: publicKey,
                })
                .rpc();

            console.log("Transaction successful:", result);

            // Now fetch the bot info
            try {
                const botInfo = await factoryProgram.methods
                    .getBotInfo(contractAddress)
                    .accounts({
                        bot: botPda,
                    })
                    .view();

                console.log("Bot info:", botInfo);

                setTabLayoutContextState({
                    ...tabLayoutContextState,
                    type: "factory",
                    localState: {
                        ...tabLayoutContextState.localState,
                        factory: [botInfo],
                    },
                    isSubmitting: false
                });
            } catch (infoErr) {
                console.error("Error fetching bot info:", infoErr);
                setTabLayoutContextState({
                    ...tabLayoutContextState,
                    error: infoErr instanceof Error ? infoErr.message : String(infoErr),
                    isSubmitting: false
                });
            }

        } catch (err) {
            console.error("Error adding bot:", err);
            setTabLayoutContextState({
                ...tabLayoutContextState,
                error: err instanceof Error ? err.message : String(err),
                isSubmitting: false
            });
        } finally {
            setIsSubmittingForm(false);
        }
    };

    async function getAllBots() {
        const factoryProgram = getProgram({ publicKey, signTransaction, signAllTransactions }, IDLPrograms.factory);
        const botList = await factoryProgram.account.bot.all();
        console.log("Bot List:", botList);
        setTabLayoutContextState({
            ...tabLayoutContextState,
            response: "",
            type: "factory",
            localState: {
                ...tabLayoutContextState.localState,
                factory: botList,
            },
            isSubmitting: false
        });
    }

    useEffect(() => {
        getAllBots();
    }, []);

    const onSubmitGetBot = async (values: z.infer<typeof formGetBotSchema>) => {
        setIsSubmittingForm(true);

        if (values.contract_address == "all") {
            getAllBots();
        } else {
            const bot = localState.factory?.find((value: any) => value.managerAddress == new PublicKey(values.contract_address));
            setTabLayoutContextState({
                ...tabLayoutContextState,
                response: "",
                type: "factory",
                localState: {
                    ...tabLayoutContextState.localState,
                    factory: [bot],
                },
                isSubmitting: false,
            });
        }

        setIsSubmittingForm(false);
    };

    return (
        <>
            {/** ADD BOTS **/}
            <Form {...formAddBot}>
                <form onSubmit={formAddBot.handleSubmit(onSubmitAddBot)} className="space-y-6">
                    <FormField
                        control={formAddBot.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bot Name" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your bot name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formAddBot.control}
                        name="prefix"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Prefix</FormLabel>
                                <FormControl>
                                    <Input placeholder="Bot Prefix" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your bot prefix.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formAddBot.control}
                        name="fee_withdraw_network"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Network Fee</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={e => field.onChange(e.target.valueAsNumber || 0)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your transaction fee.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={formAddBot.control}
                        name="fee_account"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fee Account</FormLabel>
                                <FormControl>
                                    <Input placeholder="Fee Account Address (Public Key)" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your transaction fee account address (Solana public key).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingForm}
                    >
                        {isSubmittingForm ? "Submitting..." : "Add Bot"}
                    </Button>
                </form>
            </Form>
            {/** GET BOTS **/}
            <Form {...formGetBot}>
                <form onSubmit={formGetBot.handleSubmit(onSubmitGetBot)} className="space-y-6">
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Selecione o bot" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel></SelectLabel>
                                <SelectItem value="all">Todos</SelectItem>
                                {
                                    localState.factory?.map((bot) => {
                                        return <SelectItem key={bot.account.managerAddress} value={bot.account.managerAddress}>{bot.account.name}</SelectItem>
                                    })
                                }
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <FormField
                        control={formGetBot.control}
                        name="contract_address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fee Account</FormLabel>
                                <FormControl>
                                    <Input placeholder="Fee Account Address (Public Key)" {...field} />
                                </FormControl>
                                <FormDescription>
                                    This is your transaction fee account address (Solana public key).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingForm}
                    >
                        {isSubmittingForm ? "Submitting..." : "Add Bot"}
                    </Button>
                </form>
            </Form>
        </>
    );
}