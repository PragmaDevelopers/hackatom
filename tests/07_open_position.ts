import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { WebdexPayments } from "../target/types/webdex_payments";
import { WebdexManager } from "../target/types/webdex_manager";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";
import { BN } from "bn.js";

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Open Position", async () => {
        const amount = new BN(1_000_000);
        const gas = new BN(1_000)
        const currencys = [
            {
                from: sharedState.coin.pubkey,
                to: sharedState.coin.pubkey,
            }
        ];
        const tx = await paymentsProgram.methods
            .openPosition(
                sharedState.subAccountId.toString(),
                sharedState.strategyTokenAddress,
                amount,
                sharedState.coin.pubkey,
                gas,
                currencys
            )
            .accounts({
                bot: sharedState.botPda,
                payments: sharedState.paymentsPda,
                strategyList: sharedState.strategyListPda,
                strategyBalance: sharedState.strategyBalancePda,
                subAccount: sharedState.subAccountPda,
                user: sharedState.userPda,
                signer: user.publicKey,
                lpToken: sharedState.lpTokenPda,
                userLpTokenAccount: sharedState.userLpTokenAccountAta,
                managerProgram: managerProgram.programId,
                subAccountProgram: subAccountsProgram.programId,
            })
            .rpc();

        console.log("✅ Transação:", tx);
    });
});