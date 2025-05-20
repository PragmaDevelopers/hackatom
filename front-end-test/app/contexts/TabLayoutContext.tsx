import { Wallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { createContext, ReactNode, useContext, useState } from "react";

type CoinInfo = {
    pubkey: PublicKey | null;
    name: string | null;
    symbol: string | null;
    decimals: number | null;
};

type UserData = {
    wallet: Wallet | null;
    publicKey: PublicKey | null;
};

export type SharedState = {
    contractAddress: PublicKey | null;
    botPda: PublicKey | null;
    feeCollectorNetworkAddress: PublicKey | null;
    paymentsPda: PublicKey | null;
    coin: {
        usdt: CoinInfo;
        webdex: CoinInfo;
        pol: CoinInfo;
    };
    strategyListPda: PublicKey | null;
    strategyTokenAddress: PublicKey | null;
    userPda: PublicKey | null;
    subAccountListPda: PublicKey | null;
    balanceInfoPda: PublicKey | null;
    subAccountPda: PublicKey | null;
    subAccountId: PublicKey | null;
    subAccountName: string | null;
    strategyBalancePda: PublicKey | null;
    METADATA_PROGRAM_ID: PublicKey | null;
    lpTokenPda: PublicKey | null;
    userLpTokenAccountAta: PublicKey | null;
    lpMintAuthority: PublicKey | null;
    userUsdtAccount: PublicKey | null;
    vaultUsdtAccount: PublicKey | null;
    temporaryFeePda: PublicKey | null;
    userData: UserData;
};


/**
 * TabLayoutContextValue interface for the context
 */
export interface TabLayoutContextValue {
    error: string | null;
    isSubmitting: boolean;
    response: string;
    localState: {
        factory: any[] | null;
        payments: any[] | null;
        strategy: any[] | null;
        network: any[] | null;
        manager: any[] | null;
        subAccounts: any[] | null;
    },
    shareState: SharedState,
    type: "factory" | "payments" | "strategy" | "network" | "manager" | "subAccounts";
}

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
 * TabLayoutContextProvider - Provides state context for the tab layout
 */
export function TabLayoutContextProvider({ children }: { children: ReactNode }): ReactNode {
    const [tabLayoutContextState, setTabLayoutContextState] = useState<TabLayoutContextValue>({
        response: "",
        isSubmitting: false,
        error: null,
        localState: {
            factory: null,
            manager: null,
            network: null,
            payments: null,
            strategy: null,
            subAccounts: null,
        },
        shareState: {
            contractAddress: null,
            botPda: null,
            feeCollectorNetworkAddress: null,
            paymentsPda: null,
            coin: {
                usdt: {
                    pubkey: null,
                    name: null,
                    symbol: null,
                    decimals: null,
                },
                webdex: {
                    pubkey: null,
                    name: null,
                    symbol: null,
                    decimals: null,
                },
                pol: {
                    pubkey: null,
                    name: null,
                    symbol: null,
                    decimals: null,
                },
            },
            strategyListPda: null,
            strategyTokenAddress: null,
            userPda: null,
            subAccountListPda: null,
            balanceInfoPda: null,
            subAccountPda: null,
            subAccountId: null,
            subAccountName: null,
            strategyBalancePda: null,
            METADATA_PROGRAM_ID: null,
            lpTokenPda: null,
            userLpTokenAccountAta: null,
            lpMintAuthority: null,
            userUsdtAccount: null,
            vaultUsdtAccount: null,
            temporaryFeePda: null,
            userData: {
                publicKey: null,
                wallet: null,
            }
        },
        type: "factory",
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
export function useTabLayoutContext(): {
    tabLayoutContextState: TabLayoutContextValue;
    setTabLayoutContextState: React.Dispatch<React.SetStateAction<TabLayoutContextValue>>;
} {
    const context = useContext(TabLayoutContext);
    if (!context) {
        throw new Error('useTabLayoutContext must be used within a TabLayoutContextProvider');
    }

    return context;
}