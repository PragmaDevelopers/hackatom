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

    it("Liquidity Add - Transfer And Mint ", async () => {
        const userUsdtAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.usdt.pubkey,
            user.publicKey
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)
        sharedState.userUsdtAccount = userUsdtAccount.address;

        // Mintar 1000 tokens para o usuário
        await mintTo(
            provider.connection,
            user.payer,
            sharedState.coin.usdt.pubkey,
            userUsdtAccount.address,
            user.publicKey,
            amount.toNumber(),
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        const tx = await managerProgram.methods
            .liquidityAdd(
                sharedState.strategyTokenAddress,
                sharedState.coin.usdt.decimals,
                amount
            )
            .accounts({
                bot: sharedState.botPda,
                user: sharedState.userPda,
                subAccount: sharedState.subAccountPda,
                strategyList: sharedState.strategyListPda,
                usdtMint: sharedState.coin.usdt.pubkey,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ liquidityAdd tx:", tx);

        const [lpTokenPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from('lp_token'), sharedState.strategyTokenAddress.toBuffer(), sharedState.subAccountPda.toBuffer(), sharedState.coin.usdt.pubkey.toBuffer()],
            managerProgram.programId
        );
        sharedState.lpTokenPda = lpTokenPda;

        const [mintAuthorityPda, bump] = PublicKey.findProgramAddressSync(
            [Buffer.from("mint_authority")],
            managerProgram.programId
        );
        sharedState.lpMintAuthority = mintAuthorityPda;

        const userLpTokenAccountAta = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            lpTokenPda,
            mintAuthorityPda,
            true,
        );
        sharedState.userLpTokenAccountAta = userLpTokenAccountAta.address;

        const vaultUsdtAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.usdt.pubkey,
            sharedState.subAccountPda,
            true,
        );
        sharedState.vaultUsdtAccount = vaultUsdtAccount.address;

        const ataInfo = await getAccount(provider.connection, userLpTokenAccountAta.address);
        console.log("Owner da ATA:", ataInfo.owner.toBase58());
    });

    it("Add Liquidity - Atualiza os valores", async () => {
        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_balance"), sharedState.userPda.toBuffer(), sharedState.subAccountPda.toBuffer(), sharedState.strategyTokenAddress.toBuffer()],
            subAccountProgram.programId
        );
        sharedState.strategyBalancePda = strategyBalancePda;

        const tx = await subAccountProgram.methods
            .addLiquidity(
                sharedState.strategyTokenAddress,
                sharedState.subAccountId.toString(),
                sharedState.coin.usdt.pubkey,
                amount,
                sharedState.coin.usdt.name,
                sharedState.coin.usdt.symbol,
                sharedState.coin.usdt.decimals,
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