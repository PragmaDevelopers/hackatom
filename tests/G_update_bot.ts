import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../target/types/webdex_factory";
import { PublicKey } from "@solana/web3.js";
import { sharedState } from "./setup";

describe("webdex_factoty", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
  const user = provider.wallet;

  it("Update Bot Info", async () => {
    const tx = await factoryProgram.methods
      .updateBot(
        sharedState.strategyTokenAddress,
        sharedState.subAccountPda,
        user.publicKey,
      )
      .accounts({
        bot: sharedState.botPda,
        signer: user.publicKey,
      })
      .rpc();

    console.log("🔄 Updated Bot. Tx:", tx);

    // 🔍 Buscar dados e confirmar que foram atualizados
    const botAccount = await factoryProgram.account.bot.fetch(sharedState.botPda);

    console.log("📦 Updated bot info:", {
      strategy_address: botAccount.strategyAddress.toBase58(),
      sub_account_address: botAccount.subAccountAddress.toBase58(),
      payments_address: botAccount.paymentsAddress.toBase58(),
    });
  });
});
