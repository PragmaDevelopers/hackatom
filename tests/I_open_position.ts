import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { WebdexPayments } from "../target/types/webdex_payments";
import { WebdexManager } from "../target/types/webdex_manager";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";
import { BN } from "bn.js";

describe("webdex_payments/manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    const amount = new BN(1_000_000);
    const gas = new BN(1_000)

    let fee;

    it("Open Position", async () => {
        const currencys = [
            {
                from: sharedState.coin.pol.pubkey,
                to: sharedState.coin.pol.pubkey,
            }
        ];
        const tx = await paymentsProgram.methods
            .openPosition(
                sharedState.coin.usdt.decimals,
                sharedState.subAccountId.toString(),
                sharedState.strategyTokenAddress,
                amount,
                sharedState.coin.usdt.pubkey,
                gas,
                currencys,
            )
            .accounts({
                bot: sharedState.botPda,
                botOwner: user.publicKey,
                payments: sharedState.paymentsPda,
                strategyList: sharedState.strategyListPda,
                strategyBalance: sharedState.strategyBalancePda,
                subAccount: sharedState.subAccountPda,
                user: sharedState.userPda,
                managerProgram: managerProgram.programId,
                subAccountProgram: subAccountsProgram.programId,
                lpToken: sharedState.lpTokenPda,
                userLpTokenAccount: sharedState.userLpTokenAccountAta,
                lpMintAuthority: sharedState.lpMintAuthority,
            })
            .rpc();

        console.log("✅ Transação:", tx);

        const txDetails = await provider.connection.getParsedTransaction(tx, {
            commitment: "confirmed",
        });

        console.log(txDetails)
    });
});