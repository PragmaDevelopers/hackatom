import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { WebdexPayments } from "../../target/types/webdex_payments";
import BN from "bn.js";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;

    it("Get Feer Tiers", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const feeTiers = await paymentsProgram.methods
            .getFeeTiers()
            .accounts({
                bot: botPda,
            })
            .view(); // 👈 importante: view() quando retorno != void

        console.log("Fee Tiers:", feeTiers);
    });
});