import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexNetwork } from "../target/types/webdex_network";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { sharedState } from "./setup";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("webdex_network", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const networkProgram = anchor.workspace.WebdexNetwork as Program<WebdexNetwork>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes

    it("Pay Fee +2000000", async () => {
        const amount = new BN(2_000_000);

        const [balanceInfoPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from('balance_info'), sharedState.contractAddress.toBuffer(), sharedState.userPda.toBuffer(), sharedState.coin.usdt.pubkey.toBuffer()],
            networkProgram.programId
        );
        sharedState.balanceInfoPda = balanceInfoPda;

        const tx = await networkProgram.methods
            .payFee(
                sharedState.contractAddress,
                amount,
            )
            .accounts({
                contractAddress: sharedState.contractAddress,
                user: sharedState.userPda,
                usdtMint: sharedState.coin.usdt.pubkey,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });

    it("Get Balance", async () => {
        const balanceData = await networkProgram.methods
            .getBalance()
            .accounts({
                balanceInfo: sharedState.balanceInfoPda,
            })
            .view();

        console.log("💵 balance:", balanceData.balance.toNumber());
    });

    it("Withdrawal -1000000", async () => {
        const amount = new BN(1_000_000);

        const vaultNetworkAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,
            sharedState.coin.usdt.pubkey,
            sharedState.feeCollectorNetworkAddress,
            true
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        // Mintar 1000 tokens para o usuário
        await mintTo(
            provider.connection,
            user.payer,
            sharedState.coin.usdt.pubkey,
            vaultNetworkAccount.address,
            user.publicKey,
            amount.toNumber(),
        ); // QUANDO TIVER USANDO A CARTEIRA PHANTOM, NÃO PRECISA DESSA PARTE (EU ACHO KKKKKK)

        const tx = await networkProgram.methods
            .withdrawal(amount)
            .accounts({
                balanceInfo: sharedState.balanceInfoPda,
                bot: sharedState.botPda,
                feeCollectorNetworkAddress: sharedState.feeCollectorNetworkAddress,
                usdtMint: sharedState.coin.usdt.pubkey,
                user: sharedState.userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });

    it("Get Balance", async () => {
        const balanceData = await networkProgram.methods
            .getBalance()
            .accounts({
                balanceInfo: sharedState.balanceInfoPda,
            })
            .view();

        console.log("💵 balance:", balanceData.balance.toNumber());
    });
});