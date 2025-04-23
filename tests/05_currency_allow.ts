import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexPayments } from "../target/types/webdex_payments";
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
import { createMint, getMint } from "@solana/spl-token";

export async function fetchTokenInfoFromChain(mint: String): Promise<{ name: string; symbol: string; decimals: number }> {
    const umi = createUmi('http://127.0.0.1:8899').use(mplTokenMetadata())

    // Obtém as informações da conta do mint
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

    it("Currency Allow", async () => {
        // const { name, symbol, decimals } = await fetchTokenInfoFromChain(usdcMint);

        sharedState.coin.name = "Tether USD";
        sharedState.coin.symbol = "USDT";
        sharedState.coin.decimals = 9;

        const coinMintKeypair = await createMint(
            provider.connection,
            user.payer,              // Payer
            user.publicKey,    // mintAuthority
            null,              // freezeAuthority
            sharedState.coin.decimals
        )
        sharedState.coin.pubkey = coinMintKeypair;

        [paymentsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("payments"), sharedState.botPda.toBuffer()],
            paymentsProgram.programId
        );
        sharedState.paymentsPda = paymentsPda;

        const tx = await paymentsProgram.methods
            .currencyAllow(sharedState.coin.pubkey, sharedState.coin.name, sharedState.coin.symbol, sharedState.coin.decimals)
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