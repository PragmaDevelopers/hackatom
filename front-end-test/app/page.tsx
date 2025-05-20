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
import { Input } from "@/components/ui/input";
import { getProgram, IDLPrograms } from "@/utils/anchorConfig";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
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
import { TabLayoutContextProvider, useTabLayoutContext } from './contexts/TabLayoutContext';
import AnimatedTabNavigation from '@/components/AnimatedTabNavigation';
import TabLayout from '@/components/TabLayout';
import AddBotPage from './pages/AddBotPage';

type strats = {
    contractAddress: PublicKey | undefined;
    strategies: {
        name: string;
        tokenAddress: PublicKey | undefined;
        isActive: boolean;
    }[];
}

function toggleStrategyActiveState(
    strats: strats,
    tokenPublicKey: PublicKey
): { updatedStrats: typeof strats; newActiveState: boolean | undefined } {
    // Early return if strategies array is empty or undefined
    if (!strats.strategies || strats.strategies.length === 0) {
        return { updatedStrats: strats, newActiveState: undefined };
    }

    // Convert the search key to Base58 string for comparison
    const searchPublicKeyString = tokenPublicKey.toBase58();

    // Variable to store the new active state if found
    let newActiveState: boolean | undefined = undefined;

    // Create a new strategies array with the updated isActive state
    const updatedStrategies = strats.strategies.map(strategy => {
        // Skip if tokenAddress is undefined
        if (!strategy.tokenAddress) {
            return strategy;
        }

        // Check if this is the strategy we're looking for
        if (strategy.tokenAddress.toBase58() === searchPublicKeyString) {
            // Calculate the new active state (toggled)
            newActiveState = !strategy.isActive;

            // Return a new object with the isActive state toggled
            return {
                ...strategy,
                isActive: newActiveState
            };
        }

        // Return the original strategy object for non-matches
        return strategy;
    });

    // Return a new strats object with the updated strategies array and the new active state
    return {
        updatedStrats: {
            ...strats,
            strategies: updatedStrategies
        },
        newActiveState
    };
}

function StrategySwitch(props: { name: string, tokenAddress: PublicKey, isActive: boolean, updateState: (stratPubKey: PublicKey) => void }) {
    const { isActive, name, tokenAddress, updateState } = props;
    return (
        <div className='flex flex-row'>
            <h1>{name}</h1>
            <Switch onCheckedChange={() => updateState(tokenAddress)} checked={isActive} />
        </div>
    );
}

/**
 * Strategy page component
 */
function StrategyPage(): ReactNode {
    const [pageState, setPageState] = useState<strats | null>(null);
    const [stratsToUp, setStratsToUp] = useState<{
        pubk: PublicKey,
        state: boolean,
    }[]>([]);
    const { publicKey, signTransaction, signAllTransactions, wallet } = useWallet();

    const program = getProgram({ publicKey, signTransaction, signAllTransactions }, IDLPrograms.strategy);
    const METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // Metaplex Metadata Program
    );

    // Form schema definition
    const formSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        symbol: z.string().min(1, { message: "Symbol is required." }),
        uri: z.string().url({ message: "Please enter a valid URL." }),
    });

    // Define form with Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            uri: "",
            symbol: "",
        },
    });


    const appendStrategyToUpdateList = (
        publicKey: PublicKey,
        isActive: boolean,
        setStratsToUp: React.Dispatch<React.SetStateAction<{
            pubk: PublicKey;
            state: boolean;
        }[]>>
    ): void => {
        setStratsToUp(prevStratsToUp => {
            const existingIndex = prevStratsToUp.findIndex(
                strat => strat.pubk.toBase58() === publicKey.toBase58()
            );

            if (existingIndex >= 0) {
                return prevStratsToUp;
            }

            return [
                ...prevStratsToUp,
                {
                    pubk: publicKey,
                    state: isActive
                }
            ];
        });
    };

    const upsertStrategyInUpdateList = (
        publicKey: PublicKey,
        newState: boolean,
        setStratsToUp: React.Dispatch<React.SetStateAction<{
            pubk: PublicKey;
            state: boolean;
        }[]>>
    ): { action: 'added' | 'updated' } => {
        let actionPerformed: 'added' | 'updated' = 'added';

        setStratsToUp(prevStratsToUp => {
            const existingIndex = prevStratsToUp.findIndex(
                strat => strat.pubk.toBase58() === publicKey.toBase58()
            );

            // If the entry exists, update it
            if (existingIndex !== -1) {
                actionPerformed = 'updated';
                return prevStratsToUp.map((strat, index) =>
                    index === existingIndex ? { ...strat, state: newState } : strat
                );
            }

            // If the entry doesn't exist, append it
            return [
                ...prevStratsToUp,
                {
                    pubk: publicKey,
                    state: newState
                }
            ];
        });

        return { action: actionPerformed };
    };

    const switchStrategieState = (stratPubKey: PublicKey) => {
        const { updatedStrats, newActiveState } = toggleStrategyActiveState(pageState!, stratPubKey);
        setPageState(updatedStrats);
        upsertStrategyInUpdateList(stratPubKey, newActiveState!, setStratsToUp);
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setMetadataProgramId(METADATA_PROGRAM_ID);

        const [strategyListPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), botPda!.toBuffer()],
            program.programId
        );

        setStrategyListPda(strategyListPda);

        const mint = anchor.web3.Keypair.generate();
        const strategyTokenAddress = mint.publicKey;
        setStrategyTokenAddress(strategyTokenAddress);

        const [metadataPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                strategyTokenAddress.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        );

        const result = await program.methods
            .addStrategy(
                values.name,
                values.symbol,
                values.uri,
                contractAddress
            )
            .accounts({
                bot: botPda!,
                tokenAddress: strategyTokenAddress,
                metadataProgram: METADATA_PROGRAM_ID,
                metadata: metadataPda,
                signer: publicKey!,
            })
            .rpc();

        /*
            front adicionar N estrategias
            ao clicar em uma estrategia pegar o indice dela para pegar o tokenAddress
        */
        const strategiesFetch: {
            name: string;
            tokenAddress: PublicKey;
            isActive: boolean;
        }[] = await program.methods
            .getStrategies(contractAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view();


        setPageState({
            contractAddress: pageState?.contractAddress,
            strategies: strategiesFetch
        });
    }


    const updateStrategies = async () => {
        stratsToUp.forEach(async (element: {
            pubk: PublicKey;
            state: boolean;
        }) => {
            await program.methods
                .updateStrategyStatus(contractAddress, element.pubk, element.state)
                .accounts({
                    bot: botPda!,
                    strategyList: sharedState.strategyListPda!,
                    signer: publicKey!,
                })
                .rpc();
        });
    }

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Strategy Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Moving Average Crossover" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="uri"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Strategy URI</FormLabel>
                                <FormControl>
                                    <Input placeholder="https://example.com/strategies/ma-cross" {...field} />
                                </FormControl>
                                <FormDescription>
                                    The endpoint where this strategy is hosted.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="symbol"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Trading Symbol</FormLabel>
                                <FormControl>
                                    <Input placeholder="BTC/USD" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="mt-2">Add Strategy</Button>
                </form>
            </Form>
            {
                pageState?.strategies.forEach(element => <StrategySwitch isActive={element.isActive} tokenAddress={element.tokenAddress!} name={element.name} updateState={switchStrategieState} />)!
            }
            <Button type="button" onClick={updateStrategies} className="mt-2">Update Strategies</Button>
        </div>
    );
}

function CurrencyAllowPage(): ReactNode {

    const fetchTokenInfoFromChain = async (mint: String): Promise<{ name: string; symbol: string; decimals: number }> => {
        const umi = createUmi('http://127.0.0.1:8899').use(mplTokenMetadata())

        const mintAccount = await fetchMint(umi, publicKey(`${mint}`));
        const decimals = mintAccount.decimals;

        // Deriva o PDA do metadata
        const metadataPda = findMetadataPda(umi, { mint: publicKey(`${mint}`) });

        // Busca os dados de metadata
        const metadata = await fetchMetadata(umi, metadataPda);

        return {
            name: metadata.name.trim(),
            symbol: metadata.symbol.trim(),
            decimals: decimals,
        };
    }


    return (
        <div>

        </div>
    );
}

/**
 * Main Home component
 */
function Home(): ReactNode {
    return (
        <div className="w-screen h-screen bg-neutral-50 p-2">
            <TabLayoutContextProvider>
                <AnimatedTabNavigation tabs={[
                    { id: "add_bot_page", label: "Add Bot", content: <TabLayout children={<AddBotPage />} /> },
                    { id: "strategy_page", label: "Strategy", content: <TabLayout children={<StrategyPage />} /> },
                ]} />
            </TabLayoutContextProvider>
        </div>
    );
};

export default Home;