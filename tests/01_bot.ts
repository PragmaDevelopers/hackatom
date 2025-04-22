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

  // 👉 Variáveis compartilhadas entre os testes
  let contractAddress: PublicKey;
  let botPda: PublicKey;

  it("Add Bot", async () => {
    const strategyAddress = PublicKey.default;
    const subAccountAddress = PublicKey.default;
    const tokenPassAddress = PublicKey.default;
    const paymentsAddress = PublicKey.default;

    // 🔀 contractAddress aleatório
    contractAddress = anchor.web3.Keypair.generate().publicKey;
    sharedState.contractAddress = contractAddress;

    [botPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bot"), contractAddress.toBuffer()],
      factoryProgram.programId
    );
    sharedState.botPda = botPda;

    const tx = await factoryProgram.methods
      .addBot(
        "TradingBotX", // name
        "TBX",         // prefix
        user.publicKey, // owner é quem paga
        contractAddress,
        strategyAddress,
        subAccountAddress,
        paymentsAddress,
        tokenPassAddress,
      )
      .accounts({
        signer: user.publicKey, // owner é quem paga
        managerAddress: contractAddress,
      })
      .rpc();

    console.log("✅ Transaction signature:", tx);
  });

  it("Get Bot Info", async () => {
    const botInfo = await factoryProgram.methods
      .getBotInfo(contractAddress)
      .accounts({
        bot: botPda,
      })
      .view(); // view() instead of rpc() for read-only instructions

    console.log("📦 Bot Info:", botInfo);
  });

  it("Update Bot Info", async () => {
    const newStrategyAddress = anchor.web3.Keypair.generate().publicKey;
    const newSubAccount = anchor.web3.Keypair.generate().publicKey;
    const newPayments = anchor.web3.Keypair.generate().publicKey;

    const tx = await factoryProgram.methods
      .updateBot(
        newStrategyAddress,
        newSubAccount,
        newPayments
      )
      .accounts({
        bot: botPda,
        signer: user.publicKey,
      })
      .rpc();

    console.log("🔄 Updated Bot. Tx:", tx);

    // 🔍 Buscar dados e confirmar que foram atualizados
    const botAccount = await factoryProgram.account.bot.fetch(botPda);

    console.log("📦 Updated bot info:", {
      strategy_address: botAccount.strategyAddress.toBase58(),
      sub_account_address: botAccount.subAccountAddress.toBase58(),
      payments_address: botAccount.paymentsAddress.toBase58(),
    });
  });
});
