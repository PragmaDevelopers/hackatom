import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";
import { getAccount } from "@solana/spl-token";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let subAccountListPda: PublicKey;
    let subAccountPda: PublicKey;

    it("Create SubAccount", async () => {
        const name = "Main Account";


        [subAccountListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account_list"), sharedState.userPda.toBuffer()],
            subAccountsProgram.programId
        );
        sharedState.subAccountListPda = subAccountListPda;

        [subAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account"), sharedState.userPda.toBuffer(), Buffer.from(name)],
            subAccountsProgram.programId
        );
        sharedState.subAccountPda = subAccountPda;

        const tx = await subAccountsProgram.methods
            .createSubAccount(name)
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey, // É QUEM PAGA E CRIADOR DO BOT
                user: sharedState.userPda, // É QUEM CRIA A SUBCONTA
            })
            .rpc();

        console.log("🧾 SubAccount Created TX:", tx);

        const subAccountList = await subAccountsProgram.account.subAccountList.fetch(subAccountListPda);
        const subAccount = await subAccountsProgram.account.subAccount.fetch(subAccountPda);

        expect(subAccountList.subAccounts.length).to.be.greaterThan(0);
        expect(subAccount.name).to.equal(name);

        // Passando o ID para o "Add Liquidity to SubAccount" encontrar a conta
        sharedState.subAccountId = subAccount.id;
        sharedState.subAccountName = subAccount.name;
    });

    it("Get Sub Accounts", async () => {
        // Chamada da função get_sub_accounts
        const subAccounts = await subAccountsProgram.methods
            .getSubAccounts(user.publicKey)
            .accounts({
                subAccountList: subAccountListPda,
            })
            .view();

        // ✅ Verificações
        expect(subAccounts.length).to.be.greaterThan(0);

        const first = subAccounts[0];
        expect(first).to.have.all.keys("id", "name", "subAccountAddress");

        console.log("📦 SubAccounts:", subAccounts);
    });
});