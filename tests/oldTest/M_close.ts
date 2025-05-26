import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { sharedState } from "./setup";
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
        const amount = new anchor.BN(100_000);
        const tx = await managerProgram.methods
            .liquidityRemove(
                sharedState.strategyTokenAddress,
                sharedState.coin.usdt.decimals,
                sharedState.subAccountId,
                sharedState.coin.usdt.pubkey,
                amount,
            )
            .accounts({
                bot: sharedState.botPda,
                user: sharedState.userPda,
                subAccount: sharedState.subAccountPda,
                strategyList: sharedState.strategyListPda,
                strategyBalance: sharedState.strategyBalancePda,
                usdtMint: sharedState.coin.usdt.pubkey,
                signer: user.publicKey,
                subAccountProgram: subAccountsProgram.programId,
            })
            .rpc();

        console.log("✅ liquidityRemove tx:", tx);
    });

    it("Remove Gas", async () => {
        const polAmout = new BN(1_000);

        const tx = await managerProgram.methods
            .removeGas(polAmout)
            .accounts({
                signer: user.publicKey,
                polMint: sharedState.coin.pol.pubkey,
            })
            .rpc();

        console.log("✅ Transaction:", tx);

        const updated = await managerProgram.account.user.fetch(sharedState.userPda);
        console.log("📦 After Delete:", updated.gasBalance.toNumber());
    });

    it("Pass Remove", async () => {
        const webdexAmout = new BN(1_000_000);

        const tx = await managerProgram.methods
            .passRemove(webdexAmout)
            .accounts({
                signer: user.publicKey,
                webdexMint: sharedState.coin.webdex.pubkey,
            })
            .rpc();

        console.log("✅ Transaction:", tx);

        const updated = await managerProgram.account.user.fetch(sharedState.userPda);
        console.log("📦 After Delete:", updated.passBalance);
    });

    it("Delete Strategy (MODERATE)", async () => {
        const strategyList = await strategyProgram.account.strategyList.fetch(sharedState.strategyListPda);
        const tokenAddress = strategyList.strategies[0].tokenAddress;

        const tx = await strategyProgram.methods
            .deleteStrategy(sharedState.contractAddress, tokenAddress)
            .accounts({
                bot: sharedState.botPda,
                strategyList: sharedState.strategyListPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🗑️ Delete Strategy TX:", tx);

        const updated = await strategyProgram.account.strategyList.fetch(sharedState.strategyListPda);
        console.log("📦 After Delete:", updated.strategies);
    });

    it("Remove Coin (POL) from Payments", async () => {
        const tx = await paymentsProgram.methods
            .removeCoin(sharedState.coin.pol.pubkey) // usa o mesmo Pubkey usado no addCoin
            .accounts({
                bot: sharedState.botPda,
                payments: sharedState.paymentsPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("❌ RemoveCoin TX:", tx);

        const paymentsAccount = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);
        console.log("🧾 Coins After Remove:", paymentsAccount.coins);
    });

    it("Remove Bot", async () => {
        const tx = await factoryProgram.methods
            .removeBot()
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🗑️ Bot removed. Tx:", tx);

        // 4. Verifica que foi fechado (ou o fetch falha)
        try {
            const bot = await factoryProgram.account.bot.fetch(sharedState.botPda);
            console.log("⚠️ Ainda existe:", bot);
        } catch (err) {
            console.log("✅ Conta do bot foi fechada com sucesso");
        }
    });
});