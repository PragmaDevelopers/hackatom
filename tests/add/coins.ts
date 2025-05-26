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
import { createMint } from "@solana/spl-token";

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

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    // USAR SOMENTE NA MAINNET
    // const usdcMint = "Es9vMFrzaCERZzk7B7Wc5kkw7o63HgVUsVTNffxcPbAA";
    // sharedState.coin.pubkey = new PublicKey(usdcMint);

    it("Currency Allow (USDT)", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE;

        const usdtName = "Tether USD";
        const usdtSymbol = "USDT";
        const usdtDecimals = 9;

        const usdtMint = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthority
            null,              // freezeAuthority
            usdtDecimals
        )

        const tx = await paymentsProgram.methods
            .currencyAllow(
                usdtMint,
                usdtName,
                usdtSymbol,
                usdtDecimals
            )
            .accounts({
                bot: botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);
    });

    it("Currency Allow (WEBDEX)", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE;

        const webdexName = "WEbdEX";
        const webdexSymbol = "WEBDEX";
        const webdexDecimals = 9;

        const webdexMint = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthoritys
            null,              // freezeAuthority
            webdexDecimals,
        )

        const tx = await paymentsProgram.methods
            .currencyAllow(
                webdexMint, webdexName,
                webdexSymbol,
                webdexDecimals
            )
            .accounts({
                bot: botPda,
                signer: user.publicKey,

            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);
    });

    it("Currency Allow (Solana)", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE;

        const solName = "Solana";
        const solSymbol = "SOL";
        const solDecimals = 9;

        // wrapped SOL (SPL compatible) mint
        const solMint = new PublicKey("So11111111111111111111111111111111111111112");

        const tx = await paymentsProgram.methods
            .currencyAllow(
                solMint,
                solName,
                solSymbol,
                solDecimals
            )
            .accounts({
                bot: botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);
    });
});