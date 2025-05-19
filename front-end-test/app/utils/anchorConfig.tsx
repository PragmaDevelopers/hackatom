import { AnchorProvider, Program, web3, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import factor_idl from "./IDLs/webdex_factory.json"; // IDL gerado pelo Anchor (anchor build)
import manager_idl from "./IDLs/webdex_manager.json"; // IDL gerado pelo Anchor (anchor build)
import network_idl from "./IDLs/webdex_network.json"; // IDL gerado pelo Anchor (anchor build)
import payments_idl from "./IDLs/webdex_payments.json"; // IDL gerado pelo Anchor (anchor build)
import strategy_idl from "./IDLs/webdex_strategy.json"; // IDL gerado pelo Anchor (anchor build)
import sub_accounts_idl from "./IDLs/webdex_sub_accounts.json"; // IDL gerado pelo Anchor (anchor build)

// const PROGRAM_ID = new PublicKey("CtL3hTB5hWhF9asHRJTRaYXYMCbZMuozanWHwLEiHGnH");
const NETWORK = "https://api.devnet.solana.com"; // ou mainnet, dependendo

export const IDLPrograms: {
    factor: Idl,
    manager: Idl,
    network: Idl,
    payments: Idl,
    strategy: Idl,
    sub_accounts: Idl,
} = {
    factor: factor_idl as Idl, 
    manager: manager_idl as Idl,
    network: network_idl as Idl,
    payments: payments_idl as Idl,
    strategy: strategy_idl as Idl,
    sub_accounts: sub_accounts_idl as Idl,
}

export const getProvider = (wallet: any) => {
    const connection = new Connection(NETWORK, "processed");
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
    });
    return provider;
};

export const getProgram = (wallet: any, idl: Idl): Program => {
    const provider = getProvider(wallet);
    return new Program(idl, provider);
};