import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;

    it("Get Coin All", async () => {
        const payments = await paymentsProgram.account.payments.all();
        console.log("📦 Coins:", payments[0].account.coins);
    });
});