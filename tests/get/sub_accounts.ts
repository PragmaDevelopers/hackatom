import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { getAccount } from "@solana/spl-token";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { BN } from "bn.js";

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

        const subAccountsTracker = await subAccountsProgram.methods
            .getSubAccountsTracker()
            .accounts({
                user: userPda,
            })
            .view();

        for (let i = 0; i < subAccountsTracker.count.toNumber(); i++) {
            const [subAccountPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("sub_account"), userPda.toBuffer(), new BN(i).toArrayLike(Buffer, "le", 8)],
                subAccountsProgram.programId
            );
            const subAccount = await subAccountsProgram.methods
                .getSubAccount()
                .accounts({
                    subAccount: subAccountPda,
                })
                .view(); // 👈 importante: view() quando retorno != void
            console.log("📦 SubAccount", i, ":", subAccount);
        }
    });
});