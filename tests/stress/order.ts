import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexManager } from "../../target/types/webdex_manager";
import { BN } from "bn.js";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";

describe("webdex_payments/manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Stress Test - Position Liquidity + Rebalance", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const solMint = payments[0].account.coins.find(token => token.coin.symbol == "SOL");
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const [paymentsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("payments"), botPda.toBuffer()],
            paymentsProgram.programId
        );

        const [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), botPda.toBuffer()],
            strategyProgram.programId
        );

        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies()
            .accounts({
                bot: botPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

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

        const currencys = [
            {
                from: solMint.pubkey,
                to: usdtMint.pubkey,
            }
        ];

        const totalRuns = 10; // 🔁 Número de execuções para o teste
        const amount = new BN(10_000_000);
        const gas = new BN(1_000_000)

        for (let i = 0; i < totalRuns; i++) {
            console.log(`🚀 Execução #${i + 1}...`);

            try {
                const tx1 = await subAccountsProgram.methods
                    .positionLiquidity(
                        subAccount.id,
                        strategies[0].tokenAddress,
                        amount,
                        usdtMint.pubkey,
                        gas,
                        currencys,
                    )
                    .accounts({
                        user: userPda,
                        bot: botPda,
                        payments: paymentsPda,
                        strategyList: strategyListPda,
                        signer: user.publicKey,
                        subAccount: subAccountPda,
                    })
                    .rpc();
                console.log(`✅ positionLiquidity: ${tx1}`);

                const [strategyBalancePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("strategy_balance"), userPda.toBuffer(), subAccountPda.toBuffer(), strategies[0].tokenAddress.toBuffer()],
                    subAccountsProgram.programId
                );

                const [temporaryRebalancePda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("temporary_rebalance"), botPda.toBuffer(), userPda.toBuffer(), subAccountPda.toBuffer(), strategyBalancePda.toBuffer(), paymentsPda.toBuffer()],
                    subAccountsProgram.programId
                );

                const tx2 = await managerProgram.methods
                    .rebalancePosition(
                        strategies[0].tokenAddress,
                        usdtMint.coin.decimals,
                        amount,
                        gas,
                    )
                    .accounts({
                        bot: botPda,
                        user: userPda,
                        strategyBalance: strategyBalancePda,
                        subAccount: subAccountPda,
                        temporaryRebalance: temporaryRebalancePda,
                        signer: user.publicKey,
                        tokenMint: usdtMint.pubkey,
                    })
                    .rpc();
                console.log(`✅ rebalancePosition: ${tx2}`);
            } catch (err) {
                console.error(`❌ Erro na execução #${i + 1}:`, err.logs || err.message);
            }
        }
    });
});