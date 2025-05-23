import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

describe("webdex_close", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Liquidity Remove - Burn And Transfer", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

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

        const subAccountPda = subAccounts[0].subAccountAddress;

        const amount = new BN(50_000_000_000);

        // FAZ O BURN
        const tx = await managerProgram.methods
            .liquidityRemove(
                strategies[0].tokenAddress,
                usdtMint.coin.decimals,
                amount,
            )
            .accounts({
                subAccount: subAccountPda,
                strategyList: strategyListPda,
                signer: user.publicKey,
                tokenMint: usdtMint.pubkey,
            })
            .rpc();

        console.log("✅ liquidityRemove tx:", tx);

        console.log("Add Liquidity - Atualiza o saldo")

        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_balance"), userPda.toBuffer(), subAccountPda.toBuffer(), strategies[0].tokenAddress.toBuffer()],
            subAccountsProgram.programId
        );

        // ATUALIZA O SALDO
        const txa = await subAccountsProgram.methods
            .removeLiquidity(
                subAccounts[0].id,
                strategies[0].tokenAddress,
                usdtMint.pubkey,
                amount,
            )
            .accounts({
                bot: botPda,
                subAccount: subAccountPda,
                strategyBalance: strategyBalancePda,
            })
            .rpc();

        console.log("✅ TX Hash:", txa);
    });
});