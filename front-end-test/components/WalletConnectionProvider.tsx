// app/components/WalletConnectionProvider.tsx

"use client";

import React, { FC, ReactNode, useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

interface Props {
    children: ReactNode;
}

export const WalletConnectionProvider: FC<Props> = ({ children }) => {
    const network = "devnet";
    const endpoint = clusterApiUrl(network);

    const wallets = useMemo(
        () => [new PhantomWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};