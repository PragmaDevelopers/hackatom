import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { PublicKey } from "@solana/web3.js";
import { sharedState } from "./setup";
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

    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let paymentsPda: PublicKey;

    // USAR SOMENTE NA MAINNET
    // const usdcMint = "Es9vMFrzaCERZzk7B7Wc5kkw7o63HgVUsVTNffxcPbAA";
    // sharedState.coin.pubkey = new PublicKey(usdcMint);

    it("Currency Allow (USDT)", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        sharedState.coin.usdt.name = "Tether USD";
        sharedState.coin.usdt.symbol = "USDT";
        sharedState.coin.usdt.decimals = 9;

        const usdcMint = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthority
            null,              // freezeAuthority
            sharedState.coin.usdt.decimals
        )
        sharedState.coin.usdt.pubkey = usdcMint;

        [paymentsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("payments"), sharedState.botPda.toBuffer()],
            paymentsProgram.programId
        );
        sharedState.paymentsPda = paymentsPda;

        const tx = await paymentsProgram.methods
            .currencyAllow(sharedState.coin.usdt.pubkey, sharedState.coin.usdt.name, sharedState.coin.usdt.symbol, sharedState.coin.usdt.decimals)
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);
    });

    it("Currency Allow (WEBDEX)", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        sharedState.coin.webdex.name = "WEbdEX";
        sharedState.coin.webdex.symbol = "WEBDEX";
        sharedState.coin.webdex.decimals = 9;

        const webdexMint = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthority
            null,              // freezeAuthority
            sharedState.coin.webdex.decimals
        )
        sharedState.coin.webdex.pubkey = webdexMint;

        const tx = await paymentsProgram.methods
            .currencyAllow(sharedState.coin.webdex.pubkey, sharedState.coin.webdex.name, sharedState.coin.webdex.symbol, sharedState.coin.webdex.decimals)
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);
    });

    it("Currency Allow (Polygon)", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        sharedState.coin.pol.name = "Polygon Mainnet";
        sharedState.coin.pol.symbol = "POL";
        sharedState.coin.pol.decimals = 18;

        const polMint = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthority
            null,              // freezeAuthority
            sharedState.coin.pol.decimals
        )
        sharedState.coin.pol.pubkey = polMint;

        [paymentsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("payments"), sharedState.botPda.toBuffer()],
            paymentsProgram.programId
        );
        sharedState.paymentsPda = paymentsPda;

        const tx = await paymentsProgram.methods
            .currencyAllow(sharedState.coin.pol.pubkey, sharedState.coin.pol.name, sharedState.coin.pol.symbol, sharedState.coin.pol.decimals)
            .accounts({
                bot: sharedState.botPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🧯 Allow Coin TX:", tx);

        // ✅ Validação opcional
        const paymentsData = await paymentsProgram.account.payments.fetch(sharedState.paymentsPda);

        paymentsData.coins.forEach((c, i) => {
            console.log(`🔹 Coin #${i + 1}`);
            console.log("   🪙 Pubkey:", c.pubkey.toBase58());
            console.log("   💵 Name:", c.coin.name);
            console.log("   ✳️ Symbol:", c.coin.symbol);
            console.log("   🔢 Decimals:", c.coin.decimals);
            console.log("   ✅ Status:", c.coin.status);
        });
    });
});