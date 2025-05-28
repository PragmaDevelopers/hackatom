import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { WebdexFactory } from "../../../target/types/webdex_factory";
import { WebdexManager } from "../../../target/types/webdex_manager";
import { BN } from "bn.js";

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

        const [subAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account"), userPda.toBuffer(), new BN(0).toArrayLike(Buffer, "le", 8)],
            subAccountsProgram.programId
        );

        const subAccount = await subAccountsProgram.methods
            .getSubAccount()
            .accounts({
                subAccount: subAccountPda,
            })
            .view();

        const result = await subAccountsProgram.methods
            .getSubAccountStrategies(subAccount.id)
            .accounts({
                subAccount: subAccountPda,
            })
            .view();

        console.log("🔗 Estratégias vinculadas à subconta:", result);
    });
});