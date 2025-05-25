import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;

    it("Get Sub Accounts List - Bot", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots.map((bot) => bot.publicKey)[0]; // BOT 1 - ONE

        const subAccounts = await subAccountsProgram.account.subAccount.all([
            {
                memcmp: {
                    offset: 8, // pula o discriminator
                    bytes: botPda.toBase58(), // começa no campo `bot`
                },
            },
        ]);

        console.log("📦 SubAccounts:", subAccounts);
    });
});