import { AnchorProvider, Program, web3, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "./webdexfactory.json"; // IDL gerado pelo Anchor (anchor build)

const PROGRAM_ID = new PublicKey("CtL3hTB5hWhF9asHRJTRaYXYMCbZMuozanWHwLEiHGnH");
const NETWORK = "https://api.devnet.solana.com"; // ou mainnet, dependendo

export const getProvider = (wallet: any) => {
    const connection = new Connection(NETWORK, "processed");
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
    });
    return provider;
};

export const getProgram = (wallet: any): Program => {
    const provider = getProvider(wallet);
    return new Program(idl as Idl, provider);
};