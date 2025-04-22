import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { sharedState } from "../setup";

describe("webdex_payments", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
  const user = provider.wallet;

  // 👉 Variáveis compartilhadas entre os testes
  let coinToAdd: PublicKey;

  it("Add Feer Tiers", async () => {
    const feeTiers = [
      {
        limit: new BN(3),
        fee: new BN(300),
      },
      {
        limit: new BN(4),
        fee: new BN(400),
      },
    ];

    const tx = await paymentsProgram.methods
      .addFeeTiers(
        sharedState.contractAddress,
        feeTiers,
      )
      .accounts({
        bot: sharedState.botPda,
        payments: sharedState.paymentsPda,
        owner: user.publicKey, // owner é quem paga
        contractAddress: sharedState.contractAddress,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("✅ Transaction signature:", tx);
  });

  it("Get Feer Tiers", async () => {
    const feeTiers = await paymentsProgram.methods
      .getFeeTiers()
      .accounts({
        payments: sharedState.paymentsPda,
      })
      .view(); // 👈 importante: view() quando retorno != void

    console.log("Fee Tiers:", feeTiers);
  });

  it("Add Coin to Payments", async () => {
    coinToAdd = anchor.web3.Keypair.generate().publicKey;
    sharedState.coinToAdd = coinToAdd;

    // Adiciona um coin
    const tx = await paymentsProgram.methods
      .addCoin(
        coinToAdd,
        "USD Coin",
        "USDC",
        6
      )
      .accounts({
        bot: sharedState.botPda,
        payments: sharedState.paymentsPda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("💰 AddCoin TX:", tx);

    const paymentsAccount = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);
    console.log("🧾 Coins:", paymentsAccount.coins);
  });

  it("Currency Allow", async () => {
    const tx = await paymentsProgram.methods
      .currencyAllow(coinToAdd)
      .accounts({
        bot: sharedState.botPda,
        payments: sharedState.paymentsPda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey,
      })
      .rpc();

    console.log("🧯 Allow Coin TX:", tx);

    // ✅ Validação opcional
    const paymentsData = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);
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
    const tx = await paymentsProgram.methods
      .currencyRevoke(coinToAdd)
      .accounts({
        bot: sharedState.botPda,
        payments: sharedState.paymentsPda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey,
        systemProgram: SystemProgram.programId
      })
      .rpc();

    console.log("🧯 Revoke Coin TX:", tx);

    // ✅ Validação opcional
    const paymentsData = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);
    paymentsData.coins.forEach((c, i) => {
      console.log(`🔹 Coin #${i + 1}`);
      console.log("   🪙 Pubkey:", c.pubkey.toBase58());
      console.log("   💵 Name:", c.coin.name);
      console.log("   ✳️ Symbol:", c.coin.symbol);
      console.log("   🔢 Decimals:", c.coin.decimals);
      console.log("   ✅ Status:", c.coin.status);
    });
  });
});
