import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { expect } from "chai";
import { sharedState } from "./setup";

describe("webdex_sub_accounts", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
  const user = provider.wallet;

  // 👉 Variáveis compartilhadas entre os testes
  let subAccountListPda: PublicKey;
  let subAccountPda: PublicKey;
  let subAccountId: PublicKey;
  let strategyBalancePda: PublicKey;

  it("Create SubAccount", async () => {
    const name = "Main Account";

    [subAccountListPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sub_account_list"), sharedState.botPda.toBuffer(), user.publicKey.toBuffer()],
      subAccountsProgram.programId
    );
    sharedState.subAccountListPda = subAccountListPda;

    [subAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("sub_account"), sharedState.botPda.toBuffer(), user.publicKey.toBuffer(), Buffer.from(name)],
      subAccountsProgram.programId
    );
    sharedState.subAccountPda = subAccountPda;;

    const tx = await subAccountsProgram.methods
      .createSubAccount(name)
      .accounts({
        bot: sharedState.botPda,
        subAccountList: subAccountListPda,
        subAccount: subAccountPda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey, // É QUEM PAGA E CRIADOR DO BOT
        user: user.publicKey, // É QUEM CRIA A SUBCONTA
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("🧾 SubAccount Created TX:", tx);

    const subAccountList = await subAccountsProgram.account.subAccountList.fetch(subAccountListPda);
    const subAccount = await subAccountsProgram.account.subAccount.fetch(subAccountPda);

    expect(subAccountList.subAccounts.length).to.be.greaterThan(0);
    expect(subAccount.name).to.equal(name);
  });

  it("Get Sub Accounts", async () => {
    // Chamada da função get_sub_accounts
    const subAccounts = await subAccountsProgram.methods
      .getSubAccounts(sharedState.contractAddress)
      .accounts({
        subAccountList: subAccountListPda,
      })
      .view();

    // ✅ Verificações
    expect(subAccounts.length).to.be.greaterThan(0);

    const first = subAccounts[0];
    expect(first).to.have.all.keys("id", "name", "subAccountAddress");

    // Passando o ID para o "Add Liquidity to SubAccount" encontrar a conta
    subAccountId = first.id;

    console.log("📦 SubAccounts:", subAccounts);
  });

  it("Add Liquidity to SubAccount", async () => {
    // Constantes básicas
    const amount = new BN(1_000_000); // 1 USDT com 6 casas decimais
    const decimals = 6;
    const ico = "USDT";
    const name = "Tether USD";

    [strategyBalancePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("strategy_balance"),
        sharedState.botPda.toBuffer(),
        subAccountPda.toBuffer(),
        sharedState.strategyTokenAddress.toBuffer(),
      ],
      subAccountsProgram.programId
    );
    sharedState.strategyBalancePda = strategyBalancePda;

    const tx = await subAccountsProgram.methods
      .addLiquidity(
        subAccountId.toString(),
        sharedState.strategyTokenAddress,
        sharedState.coinToAdd,
        amount,
        name,
        ico,
        decimals
      )
      .accounts({
        bot: sharedState.botPda,
        subAccount: subAccountPda,
        strategyBalance: strategyBalancePda,
        contractAddress: sharedState.contractAddress,
        owner: user.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("✅ TX Hash:", tx);

    const strategyBalance = await subAccountsProgram.account.strategyBalanceList.fetch(strategyBalancePda);
    const subAccount = await subAccountsProgram.account.subAccount.fetch(subAccountPda);

    // ✅ Verificações
    expect(subAccount.strategies.length).to.be.greaterThan(0);
    expect(strategyBalance.listCoins.length).to.equal(1);
    expect(strategyBalance.balance[0].token.toBase58()).to.equal(sharedState.coinToAdd.toBase58());
    expect(strategyBalance.balance[0].amount.toNumber()).to.equal(amount.toNumber());
  });

  it("Get Balance", async () => {
    const result = await subAccountsProgram.methods
      .getBalance(subAccountId.toString(), sharedState.strategyTokenAddress, sharedState.coinToAdd)
      .accounts({
        subAccount: subAccountPda,
        strategyBalance: strategyBalancePda,
      })
      .view();

    console.log("BalanceStrategy:", result);

    expect(result.token.toBase58()).to.equal(sharedState.coinToAdd.toBase58());
    expect(result.status).to.be.true;
  });

  it("Get Balances", async () => {
    const result = await subAccountsProgram.methods
      .getBalances(subAccountId.toString(), sharedState.strategyTokenAddress)
      .accounts({
        subAccount: subAccountPda,
        strategyBalance: strategyBalancePda,
      })
      .view();  // Indicando que é uma chamada "view" (sem transação)

    console.log("BalanceStrategy:", result);  // Imprimindo o resultado do teste para depuração
  });
});
