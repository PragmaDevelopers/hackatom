import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";
import BN from "bn.js";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    it("Add Feer Tiers", async () => {
        const DECIMALS = 9; // WEBDEX
        const TEN_TO_DECIMALS = new BN(10).pow(new BN(DECIMALS));

        const feeTiers = [
            {
                limit: new BN(1).mul(TEN_TO_DECIMALS),   // 1 token
                fee: new BN(300),                        // 3.00%
            },
            {
                limit: new BN(10).mul(TEN_TO_DECIMALS),  // 10 tokens
                fee: new BN(250),                        // 2.50%
            },
            {
                limit: new BN("18446744073709551615"),   // MAX u64 (ou use u64::MAX on-chain)
                fee: new BN(200),                        // 2.00%
            },
        ];

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const tx = await paymentsProgram.methods
            .addFeeTiers(
                bots[0].account.managerAddress,
                feeTiers,
            )
            .accounts({
                bot: botPda,
                signer: user.publicKey,
            })
            .rpc();
        console.log("✅ Transaction signature:", tx);
    });
});