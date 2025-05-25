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

    const amount = new BN(10_000_000_000);
    const gas = new BN(1_000_000_000)

    it("Position Liquidity", async () => {
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
            .getStrategies(bots[0].account.managerAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

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

        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_balance"), userPda.toBuffer(), subAccountPda.toBuffer(), strategies[0].tokenAddress.toBuffer()],
            subAccountsProgram.programId
        );

        const currencys = [
            {
                from: solMint.pubkey,
                to: usdtMint.pubkey,
            }
        ];

        const tx = await subAccountsProgram.methods
            .positionLiquidity(
                subAccounts[0].account.id,
                strategies[0].tokenAddress,
                amount,
                usdtMint.pubkey,
                gas,
                currencys,
            )
            .accounts({
                bot: botPda,
                payments: paymentsPda,
                strategyList: strategyListPda,
                strategyBalance: strategyBalancePda,
                subAccount: subAccountPda,
                user: userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transação:", tx);

        const [temporaryRebalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("temporary_rebalance"), botPda.toBuffer(), userPda.toBuffer(), subAccountPda.toBuffer(), strategyBalancePda.toBuffer(), paymentsPda.toBuffer()],
            subAccountsProgram.programId
        );

        const txa = await managerProgram.methods
            .rebalancePosition(
                strategies[0].tokenAddress,
                usdtMint.coin.decimals,
                amount,
                gas,
            )
            .accounts({
                bot: botPda,
                subAccount: subAccountPda,
                user: userPda,
                temporaryRebalance: temporaryRebalancePda,
                signer: user.publicKey,
                tokenMint: usdtMint.pubkey,
            })
            .rpc();

        console.log("✅ Transação:", txa);
    });
});