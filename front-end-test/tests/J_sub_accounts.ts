import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let isPausedCoin: Boolean;

    it("Get Balance", async () => {
        const result = await subAccountsProgram.methods
            .getBalance(sharedState.subAccountId, sharedState.strategyTokenAddress, sharedState.coin.usdt.pubkey)
            .accounts({
                subAccount: sharedState.subAccountPda,
                strategyBalance: sharedState.strategyBalancePda,
            })
            .view();

        isPausedCoin = result.paused;

        result.amount = result.amount.toNumber() // Convertendo BN pra Number

        console.log("BalanceStrategy:", result);

        expect(result.token.toBase58()).to.equal(sharedState.coin.usdt.pubkey.toBase58());
        expect(result.status).to.be.true;
    });

    it("Get Sub Account Strategies", async () => {
        const result = await subAccountsProgram.methods
            .getSubAccountStrategies(sharedState.subAccountId)
            .accounts({
                subAccount: sharedState.subAccountPda,
            })
            .view();

        console.log("🔗 Estratégias vinculadas à subconta:", result);

        // Valida retorno
        expect(Array.isArray(result)).to.be.true;
        expect(result.every((key) => key instanceof anchor.web3.PublicKey)).to.be.true;
    });

    it("Toggle Pause", async () => {
        const tx = await subAccountsProgram.methods
            .togglePause(
                sharedState.subAccountId,
                sharedState.strategyTokenAddress,
                sharedState.coin.usdt.pubkey,
                !isPausedCoin
            )
            .accounts({
                bot: sharedState.botPda,
                user: sharedState.userPda,
                subAccount: sharedState.subAccountPda,
                strategyBalance: sharedState.strategyBalancePda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🔁 Toggle Pause TX:", tx);
    });

    it("Get Balances", async () => {
        const result = await subAccountsProgram.methods
            .getBalances(sharedState.subAccountId, sharedState.strategyTokenAddress)
            .accounts({
                subAccount: sharedState.subAccountPda,
                strategyBalance: sharedState.strategyBalancePda,
            })
            .view();  // Indicando que é uma chamada "view" (sem transação)

        result[0].amount = result[0].amount.toNumber()

        console.log("BalanceStrategy:", result);  // Imprimindo o resultado do teste para depuração
    });

    it("Find Sub Account Index By Id", async () => {
        // Chamada da função get_sub_accounts
        const subAccountsIndex = await subAccountsProgram.methods
            .findSubAccountIndexById(sharedState.subAccountId)
            .accounts({
                subAccountList: sharedState.subAccountListPda,
            })
            .view();

        console.log("📦 SubAccounts:", subAccountsIndex);
    });
});