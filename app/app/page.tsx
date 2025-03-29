"use client";

import '@solana/wallet-adapter-react-ui/styles.css';
import React, { useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AddBotForm } from '@/components/AddBotForm';

const Home: React.FC = () => {
  const { publicKey, connect, disconnect, wallet } = useWallet();

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
      alert("Desconectado com sucesso!");
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  return (
    <div className="text-center">
      <h1>Solana Wallet Connect</h1>
      {publicKey ? (
        <div>
          <p>Connected as: {publicKey.toBase58()}</p>
          <p>Wallet: {wallet?.adapter.name}</p>
          <button onClick={handleDisconnect}>Disconnect</button>
          <AddBotForm />
        </div>
      ) : (
        <WalletMultiButton />
      )}
    </div>
  );
};

export default Home;