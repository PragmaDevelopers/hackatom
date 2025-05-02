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
import { InitialSharedState, SharedState, useSharedStateStore } from '@/utils/store';
import { Switch } from '@/components/ui/switch';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";


/**
 * Type definitions
 */
type AnimatedTab = {
    id: string;
    label: string;
    content: ReactNode;
}

/**
 * TabLayoutContextValue interface for the context
 */
interface TabLayoutContextValue {
    error: string | null;
    isSubmitting: boolean;
    botInfo: any;
    response: string;
    localState: SharedState | null;
}

/**
 * Animation variants for tab content transitions
 */
const contentVariants = {
    enter: (direction: string) => ({
        x: direction === 'left' ? '-100%' : '100%',
    }),
    center: {
        x: 0,
        transition: {
            x: { type: 'spring', duration: 0.6 },
        }
    },
    exit: (direction: string) => ({
        x: direction === 'left' ? '100%' : '-100%',
        transition: {
            x: { type: 'spring', duration: 0.6 },
        }
    })
};

/**
 * Context for tab layout state
 */
const TabLayoutContext: React.Context<{
    tabLayoutContextState: TabLayoutContextValue;
    setTabLayoutContextState: React.Dispatch<React.SetStateAction<TabLayoutContextValue>>;
} | undefined> = createContext<{
    tabLayoutContextState: TabLayoutContextValue;
    setTabLayoutContextState: React.Dispatch<React.SetStateAction<TabLayoutContextValue>>;
} | undefined>(undefined);

/**
 * Copy button component with animation
 */
function CopyButton({
    value,
    className,
    variant = "outline",
    size = "sm",
    onCopy,
    ...props
}: any): ReactNode {
    const [hasCopied, setHasCopied] = useState(false);

    useEffect(() => {
        if (hasCopied) {
            const timeout = setTimeout(() => {
                setHasCopied(false)
            }, 2000)

            return () => clearTimeout(timeout)
        }
    }, [hasCopied]);

    const handleCopy = async () => {
        if (!value) return;

        try {
            await navigator.clipboard.writeText(value);
            setHasCopied(true);
            onCopy?.(value);
        } catch (error) {
            console.error('Failed to copy', error);
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn(
                "relative group",
                hasCopied && "text-green-500 border-green-500 hover:bg-green-50 dark:hover:bg-green-950",
                className
            )}
            {...props}
        >
            <span className={cn(
                "transition-opacity",
                hasCopied ? "opacity-0" : "opacity-100"
            )}>
                <CopyIcon className="h-4 w-4" />
            </span>

            <span className={cn(
                "absolute inset-0 flex items-center justify-center transition-opacity",
                hasCopied ? "opacity-100" : "opacity-0"
            )}>
                <CheckIcon className="h-4 w-4" />
            </span>

            <span className="sr-only">
                {hasCopied ? "Copied" : "Copy"}
            </span>
        </Button>
    )
}

/**
 * Helper function to handle circular references in JSON stringification
 */
function getCircularReplacer(): any {
    const seen = new WeakSet();
    return (_: any, value: any) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return "[Circular Reference]";
            }
            seen.add(value);
        }
        return value;
    };
}

/**
 * JSON display component with syntax highlighting
 */
function JsonDisplay({ data, className }: { data: any, className?: string }): ReactNode {
    const jsonString = JSON.stringify(data, getCircularReplacer(), 4);

    return (
        <SyntaxHighlighter
            language="json"
            style={atomDark}
            wrapLines={true}
            wrapLongLines={true}
            className={className}
        >
            {jsonString}
        </SyntaxHighlighter>
    );
}

/**
 * Helper function to validate string existence
 */
function isValidString(
    value: unknown,
    options: {
        allowEmpty?: boolean;
        allowWhitespace?: boolean;
        pattern?: RegExp;
    } = {}
): value is string {
    const {
        allowEmpty = false,
        allowWhitespace = false,
        pattern = undefined
    } = options;

    if (typeof value !== 'string') {
        return false;
    }

    if (!allowEmpty && value.length === 0) {
        return false;
    }

    if (!allowWhitespace && value.trim().length === 0) {
        return false;
    }

    if (pattern && !pattern.test(value)) {
        return false;
    }

    return true;
}

/**
 * TabLayoutContextProvider - Provides state context for the tab layout
 */
function TabLayoutContextProvider({ children }: { children: ReactNode }): ReactNode {
    const [tabLayoutContextState, setTabLayoutContextState] = useState<TabLayoutContextValue>({
        botInfo: null,
        response: "",
        isSubmitting: false,
        error: null,
        localState: null,
    });

    const contextValue = {
        tabLayoutContextState,
        setTabLayoutContextState
    };

    return (
        <TabLayoutContext.Provider value={contextValue}>
            {children}
        </TabLayoutContext.Provider>
    );
}

/**
 * Hook to use tab layout context
 */
function useTabLayoutContext(): {
    tabLayoutContextState: TabLayoutContextValue;
    setTabLayoutContextState: React.Dispatch<React.SetStateAction<TabLayoutContextValue>>;
} {
    const context = useContext(TabLayoutContext);
    if (!context) {
        throw new Error('useTabLayoutContext must be used within a TabLayoutContextProvider');
    }

    return context;
}

/**
 * Animated tab navigation component
 */
function AnimatedTabNavigation({ tabs }: { tabs: AnimatedTab[] }): ReactNode {
    const { publicKey, disconnect, wallet } = useWallet();
    const [activeTab, setActiveTab] = useState('tab-b');
    const [direction, setDirection] = useState('');
    const prevTabIndexRef = useRef(1);

    useEffect(() => {
        if (publicKey) {
            console.log("Wallet connected:", publicKey.toBase58());
        } else {
            console.log("Wallet disconnected");
        }
    }, [publicKey]);

    const handleDisconnect = async () => {
        try {
            await disconnect();
            alert("Wallet disconnected successfully!");
        } catch (error) {
            console.error("Error disconnecting wallet:", error);
        }
    };

    const getTabIndex = (tabId: string) => tabs.findIndex(tab => tab.id === tabId);

    const handleTabChange = (tabId: string) => {
        const newTabIndex = getTabIndex(tabId);
        const prevTabIndex = prevTabIndexRef.current;

        setDirection(newTabIndex > prevTabIndex ? 'right' : 'left');
        setActiveTab(tabId);
        prevTabIndexRef.current = newTabIndex;
    };

    return (
        <div className="w-full h-full overflow-hidden flex flex-col">
            <div className='relative w-full px-2'>
                <div className="relative w-full flex items-center justify-center flex-row bg-white rounded-lg p-1 shadow-md">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="sm" className='shadow-none drop-shadow-none'>
                                <WalletIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="relative m-2 w-fit">
                            {publicKey ? (
                                <div>
                                    <h1 className='text-2xl font-bold'>My Wallet</h1>
                                    <div className='flex flex-row justify-between items-center'>
                                        <p className='text-sm font-bold text-neutral-400 truncate w-4/5'>{publicKey.toBase58()}</p>
                                        <CopyButton value={publicKey.toBase58()} size="sm" variant="ghost" />
                                    </div>
                                    <p className='text-sm my-2 font-bold'>Provider: {wallet?.adapter.name}</p>
                                    <Button variant="destructive" onClick={handleDisconnect} className='w-full'>Disconnect</Button>
                                </div>
                            ) : (
                                <div className='flex justify-center items-center flex-col'>
                                    <h1 className='text-2xl font-bold mb-4'>Connect your wallet</h1>
                                    <WalletMultiButton />
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                    <Tabs
                        defaultValue="tab-b"
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="w-full"
                    >
                        <div className='bg-white w-full rounded-lg'>
                            <TabsList className="w-full relative bg-transparent">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.id}
                                        value={tab.id}
                                        className="relative z-10 py-2 data-[state=active]:drop-shadow-none data-[state=active]:shadow-none data-[state=active]:bg-neutral-800 data-[state=active]:text-neutral-50 transition-all"
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </Tabs>
                </div>
            </div>

            <div className="relative overflow-hidden mt-2 grow">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    {tabs.map((tab) => (
                        tab.id === activeTab && (
                            <motion.div
                                key={tab.id}
                                className="m-4 absolute inset-0 overflow-hidden"
                                custom={direction}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                            >
                                <div className='overflow-hidden w-full h-full'>
                                    {tab.content}
                                </div>
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

/**
 * Tab layout component for displaying content and state
 */
function TabLayout({ children }: { children: ReactNode }): ReactNode {
    const { tabLayoutContextState, setTabLayoutContextState } = useTabLayoutContext();
    const { sharedState } = useSharedStateStore();
    const { botInfo, error, response, localState } = tabLayoutContextState;
    const [showAlert, setShowAlert] = useState<boolean>(false);

    useEffect(() => {
        if (isValidString(response) || isValidString(error)) {
            setShowAlert(true);
        }
    }, [response, error]);

    const handleClose: React.Dispatch<React.SetStateAction<boolean>> = (value: React.SetStateAction<boolean>) => {
        if (isValidString(response)) {
            setTabLayoutContextState((prev: TabLayoutContextValue) => {
                return {
                    ...prev,
                    response: "",
                }
            })
        }

        if (isValidString(error)) {
            setTabLayoutContextState((prev: TabLayoutContextValue) => {
                return {
                    ...prev,
                    error: null,
                }
            })
        }

        setShowAlert(value);
    }

    return (
        <div className="mx-auto flex flex-col h-full">
            <AlertDialog open={showAlert} onOpenChange={handleClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{response ? "Result" : "Error"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {response ? response : error}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Close</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className='flex flex-row space-x-4 h-full'>
                <div className='w-1/2 bg-white p-2 rounded-md shadow-md h-fit'>
                    {children}
                </div>
                <div className='w-1/2 px-2 h-full'>
                    <Tabs defaultValue="sharedState" className="w-full h-full">
                        <TabsList className='w-full'>
                            <TabsTrigger value="sharedState">Shared State</TabsTrigger>
                            <TabsTrigger value="localState">Local State</TabsTrigger>
                            {botInfo && (
                                <TabsTrigger value="botInfo">Bot Information</TabsTrigger>
                            )}
                        </TabsList>
                        <TabsContent value="sharedState" className='h-full rounded-md'>
                            <div className='overflow-auto h-full rounded-md'>
                                {Object.keys(sharedState).length > 0 ? (
                                    <JsonDisplay data={sharedState} className="overflow-auto rounded-lg h-[80%]" />
                                ) : (
                                    <h1 className='text-xl font-bold h-full w-full flex justify-center items-center'>No shared state data available</h1>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="localState" className='h-full rounded-md'>
                            <div className='overflow-auto h-full rounded-md'>
                                {localState && Object.keys(localState).length > 0 ? (
                                    <JsonDisplay data={localState} className="overflow-auto rounded-lg h-[80%]" />
                                ) : (
                                    <h1 className='text-xl font-bold h-full w-full flex justify-center items-center'>No local state data available</h1>
                                )}
                            </div>
                        </TabsContent>
                        {botInfo && (
                            <TabsContent value="botInfo" className='h-full rounded-md'>
                                <div className='overflow-auto h-full rounded-md'>
                                    <JsonDisplay data={botInfo} className="overflow-auto rounded-lg h-[80%]" />
                                </div>
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

/**
 * AddBotPage component for adding a new Solana bot
 */
function AddBotPage(): ReactNode {
    const { publicKey, signTransaction, signAllTransactions, wallet } = useWallet();
    const [_, setBotInformation] = useState<any>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const {
        setContractAddress,
        setBotPda,
        setFeeCollectorNetworkAddress,
        setUserDataWallet,
        setUserDataPublicKey
    } = useSharedStateStore();
    const { tabLayoutContextState, setTabLayoutContextState } = useTabLayoutContext();

    // Form schema definition
    const formSchema = z.object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        prefix: z.string().min(2, { message: "Prefix must be at least 2 characters." }),
        fee_withdraw_network: z.coerce.number().min(0, { message: "Fee can't be lower than 0." }),
        fee_account: z.string().min(2, { message: "Fee account must be at least 2 characters." }),
    });

    // Define form with Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            prefix: "",
            fee_withdraw_network: 0,
            fee_account: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmittingForm(true);
        setTabLayoutContextState({
            ...tabLayoutContextState,
            error: null,
            isSubmitting: true
        });

        // Create a local variable to track state changes for display purposes
        let updatedState: SharedState = InitialSharedState;

        try {
            if (!publicKey) {
                throw new Error("Wallet not connected");
            }

            // Set user data (wallet and public key)
            setUserDataWallet(wallet);
            setUserDataPublicKey(publicKey);

            const program = getProgram({ publicKey, signTransaction, signAllTransactions }, IDLPrograms.factor);
            const contractAddress = anchor.web3.Keypair.generate().publicKey;

            // Set contract address
            setContractAddress(contractAddress);

            // Derive PDA for the bot account
            const [botPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("bot"), contractAddress.toBuffer()],
                program.programId
            );

            console.log("Contract address:", contractAddress.toString());
            console.log("Bot PDA:", botPda.toString());

            // Set bot PDA
            setBotPda(botPda);

            // Create the fee account PublicKey from the input string
            let feeAccount: PublicKey;

            try {
                feeAccount = new PublicKey(values.fee_account);
                // Set fee collector address
                setFeeCollectorNetworkAddress(feeAccount);
            } catch (err) {
                throw new Error("Invalid fee account address");
            }

            // Store local state for display purposes
            updatedState = {
                ...updatedState,
                contractAddress,
                botPda,
                feeCollectorNetworkAddress: feeAccount,
                userData: {
                    publicKey,
                    wallet,
                }
            };

            // Submit transaction to add bot
            const result = await program.methods
                .addBot(
                    values.name,
                    values.prefix,
                    publicKey, // User public key
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
                const botInfo = await program.methods
                    .getBotInfo(contractAddress)
                    .accounts({
                        bot: botPda,
                    })
                    .view();

                console.log("Bot info:", botInfo);
                setBotInformation(botInfo);

                setTabLayoutContextState({
                    ...tabLayoutContextState,
                    botInfo: botInfo,
                    response: result,
                    localState: updatedState,
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
                    control={form.control}
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
    );
}

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
    const {
        sharedState,
        setMetadataProgramId,
        setStrategyListPda,
        setStrategyTokenAddress,
    } = useSharedStateStore();

    const { botPda, contractAddress } = sharedState;

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