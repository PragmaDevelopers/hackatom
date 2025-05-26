import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { WebdexFactory } from "../../../target/types/webdex_factory";
import { WebdexManager } from "../../../target/types/webdex_manager";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Get Sub Account Strategies", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        // Chamada da função get_sub_accounts
        const subAccounts = await subAccountsProgram.account.subAccount.all([
            {
                memcmp: {
                    offset: 8 + 32, // pula discriminator + bot
                    bytes: userPda.toBase58(),
                },
            },
        ]);

        const result = await subAccountsProgram.methods
            .getSubAccountStrategies(subAccounts[0].account.name)
            .accounts({
                user: userPda,
            })
            .view();

        console.log("🔗 Estratégias vinculadas à subconta:", result);
    });
});