import { useWallet } from "@solana/wallet-adapter-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Wallet as WalletIcon } from "lucide-react";
import { PopoverTrigger, Popover, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";
import CopyButton from "./CopyButton";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

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
 * Type definitions
 */
type AnimatedTab = {
    id: string;
    label: string;
    content: ReactNode;
}

/**
 * Animated tab navigation component
 */
export default function AnimatedTabNavigation({ tabs }: { tabs: AnimatedTab[] }): ReactNode {
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