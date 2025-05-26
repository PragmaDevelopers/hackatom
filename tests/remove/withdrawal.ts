import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexNetwork } from "../../target/types/webdex_network";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import {
    getAssociatedTokenAddress,
} from "@solana/spl-token";

describe("webdex_network", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const networkProgram = anchor.workspace.WebdexNetwork as Program<WebdexNetwork>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes

    it("Withdrawal", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

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

        const subAccountPda = subAccounts[0].publicKey;

        // Authority — o sub_account_authority é uma PDA derivada
        const [subAccountAuthority] = PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account"), subAccountPda.toBuffer()],
            managerProgram.programId
        );

        // Agora derive o vault_token_account
        const vaultTokenAccount = await getAssociatedTokenAddress(
            usdtMint.pubkey,
            subAccountAuthority,
            true, // allowOwnerOffCurve (porque sub_account_authority é PDA)
        );

        const amount = new BN(10_000_000_000); // 10 USDT

        const tx = await networkProgram.methods
            .withdrawal(amount)
            .accounts({
                bot: botPda,
                signer: user.publicKey,
                subAccount: subAccountPda,
                tokenMint: usdtMint.pubkey,
                user: userPda,
                vaultTokenAccount: vaultTokenAccount,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });
});