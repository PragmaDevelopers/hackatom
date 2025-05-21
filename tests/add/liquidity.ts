import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import {
    getAccount, getOrCreateAssociatedTokenAccount, mintTo,
} from "@solana/spl-token";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    const amount = new anchor.BN(100_000);

    it("Liquidity Add - Transfer And Mint ", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");
        console.log("📦 Coins:", payments[0].account.coins);

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

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

        const [subAccountListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account_list"), botPda.toBuffer()],
            subAccountsProgram.programId
        );

        const subAccounts = await subAccountsProgram.methods
            .getSubAccounts(userPda)
            .accounts({
                subAccountList: subAccountListPda,
            })
            .view();

        const subAccountPda = subAccounts.pubkey;

        const tx = await managerProgram.methods
            .liquidityAdd(
                strategies.token_address,
                usdtMint.coin.decimals,
                amount
            )
            .accounts({
                bot: botPda,
                user: userPda,
                subAccount: subAccountPda,
                strategyList: strategyListPda,
                tokenMint: usdtMint.pubkey,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ liquidityAdd tx:", tx);

        it("Add Liquidity - Atualiza os valores", async () => {
            const [strategyBalancePda] = PublicKey.findProgramAddressSync(
                [Buffer.from("strategy_balance"), userPda.toBuffer(), subAccountPda.toBuffer(), strategies.token_address.toBuffer()],
                subAccountsProgram.programId
            );

            const tx = await subAccountsProgram.methods
                .addLiquidity(
                    strategies.token_address,
                    subAccounts.account.id.toString(),
                    usdtMint.pubkey,
                    amount,
                    usdtMint.coin.name,
                    usdtMint.coin.symbol,
                    usdtMint.coin.decimals,
                )
                .accounts({
                    user: userPda,
                    bot: botPda,
                    subAccount: subAccountPda,
                    signer: user.publicKey,
                })
                .rpc();

            console.log("✅ TX Hash:", tx);
        });
    });
});