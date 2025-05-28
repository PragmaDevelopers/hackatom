import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexNetwork } from "../../target/types/webdex_network";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";

describe("webdex_network", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const networkProgram = anchor.workspace.WebdexNetwork as Program<WebdexNetwork>;
    const user = provider.wallet;

    it("Pay Fee", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies()
            .accounts({
                bot: botPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

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

        const balance = await subAccountsProgram.methods
            .getBalance(subAccount.id, strategies[0].tokenAddress, usdtMint.pubkey)
            .accounts({
                user: userPda,
                subAccount: subAccountPda,
            })
            .view();

        const tx = await networkProgram.methods
            .payFee(
                usdtMint.pubkey,
                new BN(balance.amount),
            )
            .accounts({
                bot: botPda,
                subAccount: subAccountPda,
                user: userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });
});