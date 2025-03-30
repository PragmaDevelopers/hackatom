"use client"

import { useState } from "react";
import { getProgram } from "../utils/anchorConfig";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export const CheckBot = () => {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [contractAddress, setContractAddress] = useState("");

    const handleCheck = async () => {
        try {
            const program = getProgram({ publicKey, signTransaction, signAllTransactions });
            const botsAccount = new PublicKey("ENDEREÇO_DA_CONTA_BOT_REGISTRY"); // Defina o endereço correto

            await program.methods
                .checkBot(new PublicKey(contractAddress))
                .accounts({
                    bots: botsAccount,
                })
                .rpc();

            alert("Bot encontrado!");
        } catch (err) {
            console.error("Erro ao verificar bot:", err);
            alert("Bot NÃO encontrado ou erro.");
        }
    };

    return (
        <div>
            <h2>Verificar Bot</h2>
            <input
                placeholder="Endereço do contrato do Bot"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
            />
            <button onClick={handleCheck}>Verificar</button>
        </div>
    );
};