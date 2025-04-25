import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../target/types/webdex_manager";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import {
    createMint, getOrCreateAssociatedTokenAccount, mintTo
} from "@solana/spl-token";
import { sharedState } from "./setup";
import { BN } from "bn.js";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Add Gas", async () => {
        const polAmout = new BN(1_000_000);

        const userPolAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.pol.pubkey,
            user.publicKey
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        // Mintar 1000 tokens para o usuário
        await mintTo(
            provider.connection,
            user.payer,
            sharedState.coin.pol.pubkey,
            userPolAccount.address,
            user.publicKey,
            polAmout.toNumber(),
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        const tx = await managerProgram.methods
            .addGas(polAmout)
            .accounts({
                signer: user.publicKey,
                polMint: sharedState.coin.pol.pubkey
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });

    it("Add Pass", async () => {
        const webdexAmout = new BN(1_000_000);

        const userWebdexAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.webdex.pubkey,
            user.publicKey
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        // Mintar 1000 tokens para o usuário
        await mintTo(
            provider.connection,
            user.payer,
            sharedState.coin.webdex.pubkey,
            userWebdexAccount.address,
            user.publicKey,
            webdexAmout.toNumber(),
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        const tx = await managerProgram.methods
            .passAdd(webdexAmout)
            .accounts({
                signer: user.publicKey,
                webdexMint: sharedState.coin.webdex.pubkey
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });
});