import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { getAccount } from "@solana/spl-token";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Get Sub Accounts - User", async () => {
        // Deriva o PDA do user
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

        console.log("📦 SubAccounts:", subAccounts);
    });
});