import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { PublicKey } from "@solana/web3.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

export async function fetchTokenInfoFromChain(mint: String): Promise<{ name: string; symbol: string; decimals: number }> {
    const umi = createUmi('http://127.0.0.1:8899').use(mplTokenMetadata())

    const mintAccount = await fetchMint(umi, publicKey(`${mint}`));
    const decimals = mintAccount.decimals;

    // Deriva o PDA do metadata
    const metadataPda = findMetadataPda(umi, { mint: publicKey(`${mint}`) });

    // Busca os dados de metadata
    const metadata = await fetchMetadata(umi, metadataPda);

    return {
        name: metadata.name.trim(),
        symbol: metadata.symbol.trim(),
        decimals: decimals,
    };
}

describe("webdex_payments", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    it("Mint Tokens", async () => {
        const payments = await paymentsProgram.account.payments.all();

        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");
        const webdexMint = payments[0].account.coins.find(token => token.coin.symbol == "WEBDEX");

        const usdcTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,            // payer
            usdtMint.pubkey,                  // mint address
            user.publicKey         // owner of the token account (Anchor wallet here)
        );

        await mintTo(
            provider.connection,
            user.payer,
            usdtMint.pubkey,                    // Mint
            usdcTokenAccount.address, // Destination (ATA)
            user.payer,              // Authority (must match mint authority)
            100_000_000_000             // Amount (ex: 100 tokens with 9 decimals)
        );

        const webdexTokenAccount = await getOrCreateAssociatedTokenAccount(
            provider.connection,
            user.payer,            // payer
            webdexMint.pubkey,            // mint address
            user.publicKey         // owner of the token account (Anchor wallet here)
        );

        await mintTo(
            provider.connection,
            user.payer,
            webdexMint.pubkey,                    // Mint
            webdexTokenAccount.address, // Destination (ATA)
            user.payer,              // Authority (must match mint authority)
            100_000_000_000             // Amount (ex: 100 tokens with 9 decimals)
        );
    });
});