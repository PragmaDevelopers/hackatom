import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../target/types/webdex_manager";
import { WebdexSubAccounts } from "../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createMint, getAssociatedTokenAddress, getAssociatedTokenAddressSync, getOrCreateAssociatedTokenAccount, mintTo,
    TOKEN_PROGRAM_ID
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
        // ✅ create coin mint (usado como base asset)
        const coinMint = await createMint(
            provider.connection,
            user.payer,
            user.publicKey, // authority
            user.publicKey,
            sharedState.coin.decimals
        );

        // ✅ Derive lp_token PDA
        const [lpToken] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("lp_token"),
                sharedState.subAccountPda.toBuffer(),
                sharedState.strategyTokenAddress.toBuffer(),
                coinMint.toBuffer(),
            ],
            managerProgram.programId
        );
        sharedState.lpTokenPda = lpToken;

        // Deriva o endereço da conta de token associada do usuário
        const userTokenAccount = getAssociatedTokenAddressSync(
            lpToken, // Mint do token LP
            user.publicKey,     // Endereço público do usuário
            false,              // allowOwnerOffCurve
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        sharedState.userLpTokenAccount = userTokenAccount;

        // ✅ mint coins para o user
        await mintTo(
            provider.connection,
            user.payer,
            coinMint,
            userTokenAccount,
            user.publicKey,
            1_000_000
        );

        const tx = await managerProgram.methods
            .liquidityAdd(sharedState.strategyTokenAddress, sharedState.coin.decimals, amount)
            .accounts({
                bot: sharedState.botPda,
                user: sharedState.userPda,
                subAccount: sharedState.subAccountPda,
                strategyList: sharedState.strategyListPda,
                coin: coinMint,
                signer: user.publicKey,
            })
            .signers([]) // ou passe o user.payer se necessário
            .rpc();

        console.log("✅ liquidityAdd tx:", tx);
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