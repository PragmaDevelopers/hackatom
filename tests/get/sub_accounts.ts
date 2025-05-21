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

    // 👉 Variáveis compartilhadas entre os testes
    let subAccountListPda: PublicKey;

    it("Get Sub Accounts", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots.map((bot) => bot.publicKey)[0]; // BOT 1 - ONE

        [subAccountListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account_list"), botPda.toBuffer()],
            subAccountsProgram.programId
        );

        // Deriva o PDA do user
        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        // Chamada da função get_sub_accounts
        const subAccounts = await subAccountsProgram.methods
            .getSubAccounts(userPda)
            .accounts({
                subAccountList: subAccountListPda,
            })
            .view();

        console.log("📦 SubAccounts:", subAccounts);
    });
});