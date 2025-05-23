import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";
import {
    getOrCreateAssociatedTokenAccount, mintTo
} from "@solana/spl-token";
import { BN } from "bn.js";
import { WebdexPayments } from "../../target/types/webdex_payments";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Add Pass", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const webdexMint = payments[0].account.coins.find(token => token.coin.symbol == "WEBDEX");
        const webdexAmout = new BN(20_000_000_000);

        const tx = await managerProgram.methods
            .passAdd(webdexAmout)
            .accounts({
                signer: user.publicKey,
                webdexMint: webdexMint.pubkey,
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });
});