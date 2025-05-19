import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { WebdexPayments } from "../target/types/webdex_payments";
import { WebdexManager } from "../target/types/webdex_manager";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";
import { BN } from "bn.js";
import { disableCpiGuard } from '@solana/spl-token';

describe("webdex_payments/manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    const amount = new BN(1_000_000);
    const gas = new BN(1_000)

    it("Open Position", async () => {
        const currencys = [
            {
                from: sharedState.coin.pol.pubkey,
                to: sharedState.coin.webdex.pubkey,
            }
        ];

        const [temporaryFee, bump] = PublicKey.findProgramAddressSync(
            [Buffer.from("temporary_fee"), sharedState.botPda.toBuffer(), sharedState.userPda.toBuffer(), sharedState.subAccountPda.toBuffer(), sharedState.strategyBalancePda.toBuffer(), sharedState.paymentsPda.toBuffer()],
            paymentsProgram.programId
        );
        sharedState.temporaryFeePda = temporaryFee;

        const tx = await paymentsProgram.methods
            .openPosition(
                sharedState.coin.usdt.decimals,
                sharedState.subAccountId,
                sharedState.strategyTokenAddress,
                amount,
                sharedState.coin.usdt.pubkey,
                gas,
                currencys,
            )
            .accounts({
                bot: sharedState.botPda,
                payments: sharedState.paymentsPda,
                strategyList: sharedState.strategyListPda,
                strategyBalance: sharedState.strategyBalancePda,
                subAccount: sharedState.subAccountPda,
                user: sharedState.userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transação:", tx);
    });

    it("Rebalance Position", async () => {
        const tx = await managerProgram.methods
            .rebalancePosition(
                sharedState.strategyTokenAddress,
                sharedState.coin.usdt.decimals,
                amount,
                gas,
            )
            .accounts({
                bot: sharedState.botPda,
                botOwner: user.publicKey,
                subAccount: sharedState.subAccountPda,
                user: sharedState.userPda,
                temporaryFeeAccount: sharedState.temporaryFeePda,
                usdtMint: sharedState.coin.usdt.pubkey,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transação:", tx);
    });
});