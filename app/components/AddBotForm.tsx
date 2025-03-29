"use client"

import { useState } from "react";
import { getProgram } from "../utils/anchorConfig";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

export const AddBotForm = () => {
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const [form, setForm] = useState({
        name: "",
        prefix: "",
        contract_address: "",
        strategy_address: "",
        sub_account_address: "",
        payments_address: "",
        token_pass_address: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            const program = getProgram({ publicKey, signTransaction, signAllTransactions });

            const botsAccount = new PublicKey("ENDEREÇO_DA_CONTA_BOT_REGISTRY"); // Defina o endereço correto

            await program.methods
                .addBot(
                    form.name,
                    form.prefix,
                    publicKey!,
                    new PublicKey(form.contract_address),
                    new PublicKey(form.strategy_address),
                    new PublicKey(form.sub_account_address),
                    new PublicKey(form.payments_address),
                    new PublicKey(form.token_pass_address)
                )
                .accounts({
                    owner: publicKey!,
                    bots: botsAccount,
                })
                .rpc();

            alert("Bot adicionado com sucesso!");

        } catch (err) {
            console.error("Erro ao adicionar bot:", err);
        }
    };

    return (
        <div>
            <h2>Adicionar Bot</h2>
            <input name="name" placeholder="Nome do Bot" onChange={handleChange} />
            <input name="prefix" placeholder="Prefixo" onChange={handleChange} />
            <input name="contract_address" placeholder="Contract Address" onChange={handleChange} />
            <input name="strategy_address" placeholder="Strategy Address" onChange={handleChange} />
            <input name="sub_account_address" placeholder="Sub-Account Address" onChange={handleChange} />
            <input name="payments_address" placeholder="Payments Address" onChange={handleChange} />
            <input name="token_pass_address" placeholder="Token Pass Address" onChange={handleChange} />
            <button onClick={handleSubmit}>Adicionar Bot</button>
        </div>
    );
};
