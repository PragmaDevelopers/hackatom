import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexManager } from "../../target/types/webdex_manager";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Create SubAccount", async () => {
        const name = "Main Account";

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        // Deriva o PDA do user
        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        const tx = await subAccountsProgram.methods
            .createSubAccount(
                name,
            )
            .accounts({
                bot: botPda,
                user: userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧾 SubAccount Created TX:", tx);
    });
});