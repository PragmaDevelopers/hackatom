import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../target/types/webdex_manager";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getAccount, getOrCreateAssociatedTokenAccount, mintTo,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    transfer
} from "@solana/spl-token";
import { sharedState } from "./setup";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    const amount = new anchor.BN(100_000);

    it("Liquidity Add", async () => {
        const userCoinAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.pubkey,
            user.publicKey
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        // Mintar 1000 tokens para o usuário
        await mintTo(
            provider.connection,
            user.payer,
            sharedState.coin.pubkey,
            userCoinAccount.address,
            user.publicKey,
            amount.toNumber(),
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        const [lpTokenPda, bump] = await PublicKey.findProgramAddressSync(
            [Buffer.from('lp_token'), sharedState.subAccountPda.toBuffer(), sharedState.strategyTokenAddress.toBuffer(), sharedState.coin.pubkey.toBuffer()],
            managerProgram.programId
        );
        sharedState.lpTokenPda = lpTokenPda;

        const tx = await managerProgram.methods
            .liquidityAdd(sharedState.strategyTokenAddress, sharedState.coin.decimals, amount)
            .accounts({
                bot: sharedState.botPda,
                user: sharedState.userPda,
                subAccount: sharedState.subAccountPda,
                strategyList: sharedState.strategyListPda,
                coin: sharedState.coin.pubkey,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ liquidityAdd tx:", tx);

        const userLpTokenAccountAta = await getAssociatedTokenAddress(
            lpTokenPda,
            user.publicKey
        );
        sharedState.userLpTokenAccountAta = userLpTokenAccountAta;
    });

    it("Add Liquidity", async () => {
        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_balance"), sharedState.userPda.toBuffer(), sharedState.subAccountPda.toBuffer(), sharedState.strategyTokenAddress.toBuffer()],
            subAccountProgram.programId
        );
        sharedState.strategyBalancePda = strategyBalancePda;

        const tx = await subAccountProgram.methods
            .addLiquidity(
                sharedState.strategyTokenAddress,
                sharedState.subAccountId.toString(),
                sharedState.coin.pubkey,
                amount,
                sharedState.coin.name,
                sharedState.coin.symbol,
                sharedState.coin.decimals,
            )
            .accounts({
                user: sharedState.userPda,
                bot: sharedState.botPda,
                subAccount: sharedState.subAccountPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ TX Hash:", tx);
    });
});