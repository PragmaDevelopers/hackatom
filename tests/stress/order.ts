import * as anchor from "@coral-xyz/anchor";
import { Program, Wallet } from "@coral-xyz/anchor";
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

        const amount = new BN(100_000);
        const gas = new BN(100)

        const promises: Promise<void>[] = [];

        const currencys = [
            {
                from: solMint.pubkey,
                to: usdtMint.pubkey,
            }
        ];

        const subAccounts = await subAccountsProgram.account.subAccount.all([
            {
                memcmp: {
                    offset: 8, // pula o discriminator
                    bytes: botPda.toBase58(), // começa no campo `bot`
                },
            },
        ]);

        for (let i = 0; i < subAccounts.length; i++) {
            const userPda = subAccounts[i].account.user;
            const subAccountPda = subAccounts[i].publicKey;
            const strategiesAddress = subAccounts[i].account.listStrategies;
            const subAccountId = subAccounts[i].account.id;

            for (let y = 0; y < strategiesAddress.length; y++) {
                promises.push(
                    runStressIteration(
                        i,
                        subAccountId,
                        user.publicKey,
                        subAccountsProgram,
                        managerProgram,
                        botPda,
                        userPda,
                        subAccountPda,
                        paymentsPda, // DERIVA DE BOT
                        strategyListPda, // DERIVA DE BOT
                        strategiesAddress[y], // DERIVA DE SUBACCOUNT
                        amount,
                        gas,
                        currencys,
                        usdtMint
                    )
                );
            }

        }
        await Promise.all(promises);
        console.log("✅ Todas as execuções finalizadas em paralelo!");
    });
});

async function runStressIteration(
    i: number,
    accountId: anchor.BN,
    signer: PublicKey,
    subAccountsProgram: Program<WebdexSubAccounts>,
    managerProgram: Program<WebdexManager>,
    botPda: PublicKey,
    userPda: PublicKey,
    subAccountPda: PublicKey,
    paymentsPda: PublicKey,
    strategyListPda: PublicKey,
    strategyAddress: PublicKey,
    amount: anchor.BN,
    gas: anchor.BN,
    currencys: { from: PublicKey; to: PublicKey }[],
    usdtMint: any
) {
    console.log(`🚀 Execução #${i + 1}...`);

    try {
        const tx1 = await subAccountsProgram.methods
            .positionLiquidity(
                accountId,
                strategyAddress,
                amount,
                usdtMint.pubkey,
                gas,
                currencys
            )
            .accounts({
                user: userPda,
                bot: botPda,
                payments: paymentsPda,
                strategyList: strategyListPda,
                signer: signer, // BOT
                subAccount: subAccountPda,
            })
            .rpc();
        console.log(`✅ positionLiquidity: ${tx1}`);

        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("strategy_balance"),
                userPda.toBuffer(),
                subAccountPda.toBuffer(),
                strategyAddress.toBuffer(),
            ],
            subAccountsProgram.programId
        );

        const [temporaryRebalancePda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("temporary_rebalance"),
                botPda.toBuffer(),
                userPda.toBuffer(),
                subAccountPda.toBuffer(),
                strategyBalancePda.toBuffer(),
                paymentsPda.toBuffer(),
            ],
            subAccountsProgram.programId
        );

        const tx2 = await managerProgram.methods
            .rebalancePosition(
                strategyAddress,
                usdtMint.coin.decimals,
                amount,
                gas
            )
            .accounts({
                bot: botPda,
                user: userPda,
                strategyBalance: strategyBalancePda,
                subAccount: subAccountPda,
                temporaryRebalance: temporaryRebalancePda,
                signer: signer, // BOT
                tokenMint: usdtMint.pubkey,
            })
            .rpc();
        console.log(`✅ rebalancePosition: ${tx2}`);
    } catch (err) {
        console.error(`❌ Erro na execução #${i + 1}:`, err.logs || err.message);
    }
}  