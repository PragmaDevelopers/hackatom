import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";

describe("webdex_close", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    it("Remove Coin WEBDEX", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const payments = await paymentsProgram.account.payments.all();
        const webdexMint = payments[0].account.coins.find(token => token.coin.symbol == "WEBDEX");

        const tx = await paymentsProgram.methods
            .removeCoin(webdexMint.pubkey) // usa o mesmo Pubkey usado no addCoin
            .accounts({
                bot: botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("❌ RemoveCoin TX:", tx);
    });
});