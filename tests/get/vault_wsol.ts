import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { WebdexManager } from "../../target/types/webdex_manager";
import {
    getAssociatedTokenAddress,
} from "@solana/spl-token";
import { WebdexPayments } from "../../target/types/webdex_payments";


describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Get User", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const solMint = payments[0].account.coins.find(token => token.coin.symbol == "SOL");

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        // Authority — o sub_account_authority é uma PDA derivada
        const [vault_wsol_authority] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault_sol"), userPda.toBuffer()],
            managerProgram.programId
        );

        // Agora derive o vault_token_account
        const vaultTokenAccount = await getAssociatedTokenAddress(
            solMint.pubkey,
            vault_wsol_authority,
            true, // allowOwnerOffCurve (porque sub_account_authority é PDA)
        );

        const vaultTokenAccountInfo = await provider.connection.getAccountInfo(vaultTokenAccount);
        if (!vaultTokenAccountInfo) {
            console.log("Vault token account ainda não foi criado.");
        } else {
            console.log(vaultTokenAccountInfo)
        }
    });
});