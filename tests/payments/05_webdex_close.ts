import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { sharedState } from "../setup";

describe("webdex_close", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
  const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
  const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
  const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
  const user = provider.wallet;

  it("Delete Strategy", async () => {
    const strategyList = await strategyProgram.account.strategyList.fetch(sharedState.strategyListPda);
    const tokenAddress = strategyList.strategies[0].tokenAddress;

    const tx = await strategyProgram.methods
      .deleteStrategy(sharedState.contractAddress, tokenAddress)
      .accounts({
        bot: sharedState.botPda,
        strategyList: sharedState.strategyListPda,
        owner: user.publicKey,
        contractAddress: sharedState.contractAddress,
      })
      .rpc();

    console.log("🗑️ Delete Strategy TX:", tx);

    const updated = await strategyProgram.account.strategyList.fetch(sharedState.strategyListPda);
    console.log("📦 After Delete:", updated.strategies);
  });

  it("Remove Coin from Payments", async () => {
    const tx = await paymentsProgram.methods
      .removeCoin(sharedState.coinToAdd) // usa o mesmo Pubkey usado no addCoin
      .accounts({
        bot: sharedState.botPda,
        payments: sharedState.paymentsPda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey,
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
        owner: user.publicKey,
        systemProgram: SystemProgram.programId
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
