import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../target/types/webdex_payments";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { sharedState } from "./setup";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes

    it("Add Feer Tiers", async () => {
        const feeTiers = [
            {
                limit: new BN(3),
                fee: new BN(300),
            },
            {
                limit: new BN(4),
                fee: new BN(400),
            },
        ];
        const tx = await paymentsProgram.methods
            .addFeeTiers(
                sharedState.contractAddress,
                feeTiers,
            )
            .accounts({
                payments: sharedState.paymentsPda,
                signer: user.publicKey,
            })
            .rpc();
        console.log("✅ Transaction signature:", tx);
    });

    it("Get Feer Tiers", async () => {
        const feeTiers = await paymentsProgram.methods
            .getFeeTiers()
            .accounts({
                payments: sharedState.paymentsPda,
            })
            .view(); // 👈 importante: view() quando retorno != void

        console.log("Fee Tiers:", feeTiers);
    });

    it("Currency Revoke", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        const tx = await paymentsProgram.methods
            .currencyRevoke(sharedState.coin.usdt.pubkey, sharedState.coin.usdt.name, sharedState.coin.usdt.symbol, sharedState.coin.usdt.decimals)
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Revoke Coin TX:", tx);

        // ✅ Validação opcional
        const paymentsData = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);
        paymentsData.coins.forEach((c, i) => {
            console.log(`🔹 Coin #${i + 1}`);
            console.log("   🪙 Pubkey:", c.pubkey.toBase58());
            console.log("   💵 Name:", c.coin.name);
            console.log("   ✳️ Symbol:", c.coin.symbol);
            console.log("   🔢 Decimals:", c.coin.decimals);
            console.log("   ✅ Status:", c.coin.status);
        });
    });
});