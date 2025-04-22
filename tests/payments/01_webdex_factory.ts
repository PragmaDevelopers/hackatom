import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { sharedState } from "../setup";

describe("webdex_factoty", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
  const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
  const user = provider.wallet;

  // 👉 Variáveis compartilhadas entre os testes
  let contractAddress: PublicKey;
  let botPda: PublicKey;

  console.log(user.publicKey)

  it("Add Bot", async () => {
    const strategyAddress = new PublicKey("D3n7gYqzFLmQX8k6VCGHhBXxMQ6FN4XsyV6R3cG8y8Mk");
    const subAccountAddress = new PublicKey("3KHFCF6Vc7WjVzdEkM7z17MH2LGC5zF9D7F8y1xN1T5p");
    const tokenPassAddress = new PublicKey("2DLFw4w9Ka5GCErVNLkD1S5e8oQ3n8zgWJB59FV3TqQD");

    // 🔀 contractAddress aleatório
    contractAddress = anchor.web3.Keypair.generate().publicKey;
    sharedState.contractAddress = contractAddress;

    [botPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bot"), contractAddress.toBuffer()],
      factoryProgram.programId
    );
    sharedState.botPda = botPda;

    const [paymentsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("payments"), botPda.toBuffer()],
      paymentsProgram.programId
    );
    sharedState.paymentsPda = paymentsPda;

    const tx = await factoryProgram.methods
      .addBot(
        "TradingBotX", // name
        "TBX",         // prefix
        user.publicKey, // owner é quem paga
        contractAddress,
        strategyAddress,
        subAccountAddress,
        paymentsPda,
        tokenPassAddress,
      )
      .accounts({
        bot: botPda,
        owner: user.publicKey, // owner é quem paga
        contractAddress: contractAddress,
        systemProgram: SystemProgram.programId
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
        owner: user.publicKey,
        systemProgram: SystemProgram.programId
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

    // ✅ Asserts opcionais
    if (!botAccount.strategyAddress.equals(newStrategyAddress)) {
      throw new Error("Strategy address not updated!");
    }
  });
});
