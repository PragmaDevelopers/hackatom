import { AnchorProvider, Program, web3, Idl, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import FactorIdl from "./IDLs/webdex_factory.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexFactory } from "./IDLs/webdex_factory"; // Type gerado pelo Anchor (anchor build)
import managerIdl from "./IDLs/webdex_manager.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexManager } from "./IDLs/webdex_manager"; // Type gerado pelo Anchor (anchor build)
import networkIdl from "./IDLs/webdex_network.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexNetwork } from "./IDLs/webdex_network"; // Type gerado pelo Anchor (anchor build)
import paymentsIdl from "./IDLs/webdex_payments.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexPayments } from "./IDLs/webdex_payments"; // Type gerado pelo Anchor (anchor build)
import strategyIdl from "./IDLs/webdex_strategy.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexStrategy } from "./IDLs/webdex_strategy"; // Type gerado pelo Anchor (anchor build)
import sub_accountsIdl from "./IDLs/webdex_sub_accounts.json"; // IDL gerado pelo Anchor (anchor build)
import { WebdexSubAccounts } from "./IDLs/webdex_sub_accounts"; // Type gerado pelo Anchor (anchor build)

// const PROGRAM_ID = new PublicKey("CtL3hTB5hWhF9asHRJTRaYXYMCbZMuozanWHwLEiHGnH");
const NETWORK = "https://api.devnet.solana.com"; // ou mainnet, dependendo

type programs = WebdexFactory | WebdexManager | WebdexNetwork | WebdexPayments | WebdexStrategy | WebdexSubAccounts;

export const IDLPrograms: {
    factory: WebdexFactory,
    manager: WebdexManager,
    network: WebdexNetwork,
    payments: WebdexPayments,
    strategy: WebdexStrategy,
    sub_accounts: WebdexSubAccounts,
} = {
    factory: FactorIdl as WebdexFactory,
    manager: managerIdl as WebdexManager,
    network: networkIdl as WebdexNetwork,
    payments: paymentsIdl as WebdexPayments,
    strategy: strategyIdl as WebdexStrategy,
    sub_accounts: sub_accountsIdl as WebdexSubAccounts,
}

export const getProvider = (wallet: any) => {
    const connection = new Connection(NETWORK, "processed");
    const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
    });
    return provider;
};

export const getProgram = (wallet: any, idl: programs): Program<programs> => {
    const provider = getProvider(wallet);
    return new Program(idl, provider);
};