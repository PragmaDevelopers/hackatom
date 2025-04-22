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


    it("Currency Revoke", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        const tx = await paymentsProgram.methods
            .currencyRevoke(sharedState.coin.pubkey, sharedState.coin.name, sharedState.coin.symbol, sharedState.coin.decimals)
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

    /*it("Open Position", async () => {
        const user = provider.wallet;

        const accountId = "acc001";
        const strategyToken = new PublicKey("STRATEGY_TOKEN_PUBLIC_KEY"); // substitua
        const coin = new PublicKey("COIN_MINT_PUBLIC_KEY"); // substitua
        const amount = new anchor.BN(100_000);
        const gas = new anchor.BN(10_000);

        // Mock de moedas aceitas no payments
        const currencys = [
            {
                from: new PublicKey("TOKEN_A_PUBKEY"),
                to: new PublicKey("TOKEN_B_PUBKEY"),
            },
        ];

        const [mintAuthorityPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from("mint_authority")],
            paymentsProgram.programId
        );

        const tx = await paymentsProgram.methods
            .openPosition(
                accountId,
                strategyToken,
                amount,
                coin,
                gas,
                currencys
            )
            .accounts({
                bot: sharedState.botPda,
                payments: sharedState.paymentsPda,
                strategy: STRATEGY_PUBKEY, // substitua
                subAccountProgram: SUB_ACCOUNT_PROGRAM_ID,
                subAccount: SUB_ACCOUNT_PUBKEY,
                strategyBalance: STRATEGY_BALANCE_PUBKEY,
                user: user.publicKey,
                managerAddress: CONTRACT_ADDRESS,
                managerProgram: MANAGER_PROGRAM_ID,
                lpToken: LP_TOKEN_PUBKEY,
                tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
                mintAuthority: mintAuthorityPda,
                userLpTokenAccount: USER_LP_TOKEN_ACCOUNT,
                signer: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([])
            .rpc();

        console.log("✅ open_position tx:", tx);
    });*/
});