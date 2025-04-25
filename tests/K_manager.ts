import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../target/types/webdex_manager";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import {
    createMint, getOrCreateAssociatedTokenAccount, mintTo
} from "@solana/spl-token";
import { sharedState } from "./setup";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let userPda: PublicKey;
    let strategyListPda: PublicKey;
    let strategyTokenAddress: PublicKey;

});