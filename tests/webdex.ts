import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Webdex } from "../target/types/webdex";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";
import { expect } from "chai";

describe("webdex", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Webdex as Program<Webdex>;
  const user = provider.wallet;

  // 👉 Variáveis compartilhadas entre os testes
  let contractAddress: PublicKey;
  let botPda: PublicKey;
  let paymentsPda: PublicKey;
  let coinToAdd: PublicKey;
  let strategyListPda: PublicKey;
  let strategyTokenAddress: PublicKey;
  const METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // Metaplex Metadata Program
  );

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

    [paymentsPda] = PublicKey.findProgramAddressSync(
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
        user.publicKey, // owner é quem paga
        contractAddress,
        strategyAddress,
        subAccountAddress,
        paymentsPda,
        tokenPassAddress,
        feeTiers
      )
      .accounts({
        owner: user.publicKey, // owner é quem paga
        contractAddress: contractAddress,
        systemProgram: SystemProgram.programId
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

  it("Update Bot Info", async () => {
    const newStrategyAddress = anchor.web3.Keypair.generate().publicKey;
    const newSubAccount = anchor.web3.Keypair.generate().publicKey;
    const newPayments = anchor.web3.Keypair.generate().publicKey;

    const tx = await program.methods
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
    const botAccount = await program.account.bot.fetch(botPda);

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

  it("Add Coin to Payments", async () => {
    coinToAdd = anchor.web3.Keypair.generate().publicKey;

    // Adiciona um coin
    const tx = await program.methods
      .addCoin(
        coinToAdd,
        "USD Coin",
        "USDC",
        6
      )
      .accounts({
        bot: botPda,
        payments: paymentsPda,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("💰 AddCoin TX:", tx);

    const paymentsAccount = await program.account.payments.fetch(paymentsPda);
    console.log("🧾 Coins:", paymentsAccount.coins);
  });

  it("Currency Allow", async () => {
    const tx = await program.methods
      .currencyAllow(coinToAdd)
      .accounts({
        bot: botPda,
        payments: paymentsPda,
      })
      .rpc();

    console.log("🧯 Allow Coin TX:", tx);

    // ✅ Validação opcional
    const paymentsData = await program.account.payments.fetch(paymentsPda);
    paymentsData.coins.forEach((c, i) => {
      console.log(`🔹 Coin #${i + 1}`);
      console.log("   🪙 Pubkey:", c.pubkey.toBase58());
      console.log("   💵 Name:", c.coin.name);
      console.log("   ✳️ Symbol:", c.coin.symbol);
      console.log("   🔢 Decimals:", c.coin.decimals);
      console.log("   ✅ Status:", c.coin.status);
    });
  });

  it("Currency Revoke", async () => {
    const tx = await program.methods
      .currencyRevoke(coinToAdd)
      .accounts({
        bot: botPda,
        payments: paymentsPda,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("🧯 Revoke Coin TX:", tx);

    // ✅ Validação opcional
    const paymentsData = await program.account.payments.fetch(paymentsPda);
    paymentsData.coins.forEach((c, i) => {
      console.log(`🔹 Coin #${i + 1}`);
      console.log("   🪙 Pubkey:", c.pubkey.toBase58());
      console.log("   💵 Name:", c.coin.name);
      console.log("   ✳️ Symbol:", c.coin.symbol);
      console.log("   🔢 Decimals:", c.coin.decimals);
      console.log("   ✅ Status:", c.coin.status);
    });
  });

  it("Add Strategy", async () => {
    [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("strategy_list"), botPda.toBuffer()],
      program.programId
    );

    // 🎨 Criar uma nova conta mint (NFT)
    const mint = anchor.web3.Keypair.generate();
    strategyTokenAddress = mint.publicKey;

    // 📜 Endereço de metadados PDA conforme padrão do Metaplex
    const [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mint.publicKey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );

    // 🧪 Executa o método de adicionar strategy
    const tx = await program.methods
      .addStrategy(
        "Strategy NFT",
        "SNFT",
        "https://example.com/nft.json",
        contractAddress
      )
      .accounts({
        bot: botPda,
        strategyList: strategyListPda,
        tokenMint: mint.publicKey,
        metadataProgram: METADATA_PROGRAM_ID,
        metadata: metadataPda,
        tokenAuthority: user.publicKey, // pessoa que cria o token e poderá futuramente usá-lo para mintar ou transferir a autoridade se desejar.,
        owner: user.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([mint]) // mint precisa estar assinado se você usar anchor_mint macro
      .rpc();

    console.log("🚀 Strategy Added TX:", tx);
  });

  it("Get Strategies", async () => {
    // Chamada da função de leitura
    const strategies = await program.methods
      .getStrategies(contractAddress)
      .accounts({
        strategyList: strategyListPda,
      })
      .view(); // <- importante: view() para funções que retornam valores

    console.log("📦 Strategies List:", strategies);

    // Verificação básica (ajuste conforme seu cenário)
    expect(strategies.length).to.be.greaterThan(0);
    expect(strategies[0]).to.have.all.keys("name", "tokenAddress", "isActive");
  });

  it("Update Strategy Status", async () => {
    [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("strategy_list"), botPda.toBuffer()],
      program.programId
    );

    const strategyList = await program.account.strategyList.fetch(strategyListPda);
    const tokenAddress = strategyList.strategies[0].tokenAddress;

    const tx = await program.methods
      .updateStrategyStatus(contractAddress, tokenAddress, false)
      .accounts({
        bot: botPda,
        strategyList: strategyListPda,
      })
      .rpc();

    console.log("🔄 Updated Strategy Status TX:", tx);
  });

  it("Find Strategy by Token Address", async () => {
    const foundStrategy = await program.methods
      .findStrategy(contractAddress, strategyTokenAddress)
      .accounts({
        strategyList: strategyListPda,
      })
      .view();

    console.log("🔍 Strategy Found:", foundStrategy);
  });

  it("Create SubAccount", async () => {
    const name = "Main Account";

    const [subAccountListPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sub_account_list"), botPda.toBuffer(), user.publicKey.toBuffer()],
      program.programId
    );

    const [subAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sub_account"), botPda.toBuffer(), user.publicKey.toBuffer(), Buffer.from(name)],
      program.programId
    );

    const tx = await program.methods
      .createSubAccount(name)
      .accounts({
        bot: botPda,
        subAccountList: subAccountListPda,
        subAccount: subAccountPda,
        owner: user.publicKey, // É QUEM PAGA E CRIADOR DO BOT
        user: user.publicKey, // É QUEM CRIA A SUBCONTA
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("🧾 SubAccount Created TX:", tx);

    const subAccountList = await program.account.subAccountList.fetch(subAccountListPda);
    const subAccount = await program.account.subAccount.fetch(subAccountPda);

    expect(subAccountList.subAccounts.length).to.be.greaterThan(0);
    expect(subAccount.name).to.equal(name);
  });

  it("Delete Strategy", async () => {
    const strategyList = await program.account.strategyList.fetch(strategyListPda);
    const tokenAddress = strategyList.strategies[0].tokenAddress;

    const tx = await program.methods
      .deleteStrategy(contractAddress, tokenAddress)
      .accounts({
        bot: botPda,
        strategyList: strategyListPda,
        owner: user.publicKey,
      })
      .rpc();

    console.log("🗑️ Delete Strategy TX:", tx);

    const updated = await program.account.strategyList.fetch(strategyListPda);
    console.log("📦 After Delete:", updated.strategies);
  });

  it("Remove Coin from Payments", async () => {
    const tx = await program.methods
      .removeCoin(coinToAdd) // usa o mesmo Pubkey usado no addCoin
      .accounts({
        bot: botPda,
        payments: paymentsPda,
        owner: user.publicKey,
      })
      .rpc();

    console.log("❌ RemoveCoin TX:", tx);

    const paymentsAccount = await program.account.payments.fetch(paymentsPda);
    console.log("🧾 Coins After Remove:", paymentsAccount.coins);
  });

  it("Remove Bot", async () => {
    const tx = await program.methods
      .removeBot()
      .accounts({
        bot: botPda,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("🗑️ Bot removed. Tx:", tx);

    // 4. Verifica que foi fechado (ou o fetch falha)
    try {
      const bot = await program.account.bot.fetch(botPda);
      console.log("⚠️ Ainda existe:", bot);
    } catch (err) {
      console.log("✅ Conta do bot foi fechada com sucesso");
    }
  });
});
