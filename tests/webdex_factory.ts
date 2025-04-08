import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../target/types/webdex_factory";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";

describe("webdex_factory", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
  const user = provider.wallet;

  // 👉 Variáveis compartilhadas entre os testes
  let contractAddress: PublicKey;
  let botPda: PublicKey;

  it("Add Bot with Fee Tiers", async () => {
    const strategyAddress = new PublicKey("D3n7gYqzFLmQX8k6VCGHhBXxMQ6FN4XsyV6R3cG8y8Mk");
    const subAccountAddress = new PublicKey("3KHFCF6Vc7WjVzdEkM7z17MH2LGC5zF9D7F8y1xN1T5p");
    const tokenPassAddress = new PublicKey("2DLFw4w9Ka5GCErVNLkD1S5e8oQ3n8zgWJB59FV3TqQD");

    // 🔀 contractAddress aleatório
    contractAddress = anchor.web3.Keypair.generate().publicKey;

    [botPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bot"), contractAddress.toBuffer()],
      program.programId
    );

    const [paymentsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("payments"), botPda.toBuffer()],
      program.programId
    );

    const bnToUint8Array32 = (bn: BN): number[] => {
      return bn.toArray("le", 32);
    };

    const feeTiers = [
      {
        limit: bnToUint8Array32(new BN(1)),
        fee: bnToUint8Array32(new BN(100)),
      },
      {
        limit: bnToUint8Array32(new BN(2)),
        fee: bnToUint8Array32(new BN(200)),
      },
    ];

    const tx = await program.methods
      .addBotFeeTiers(
        "TradingBotX", // name
        "TBX",         // prefix
        user.publicKey,
        contractAddress,
        strategyAddress,
        subAccountAddress,
        paymentsPda,
        tokenPassAddress,
        feeTiers
      )
      .accounts({
        user: user.publicKey,
        contractAddress: contractAddress,
      })
      .rpc();

    console.log("✅ Transaction signature:", tx);
  });

  it("Get Bot Info", async () => {
    const botInfo = await program.methods
      .getBotInfo(contractAddress)
      .accounts({
        bot: botPda,
      })
      .view(); // view() instead of rpc() for read-only instructions

    console.log("📦 Bot Info:", botInfo);
  });
});
