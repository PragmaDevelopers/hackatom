import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { PublicKey } from "@solana/web3.js";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_strategy", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // Metaplex Metadata Program
    );
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes

    it("Add Strategy", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        // 🎨 Criar uma nova conta mint (NFT)
        const mint = anchor.web3.Keypair.generate();
        const strategyTokenAddress = mint.publicKey;

        // 📜 Endereço de metadados PDA conforme padrão do Metaplex
        const [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("metadata"),
                METADATA_PROGRAM_ID.toBuffer(),
                strategyTokenAddress.toBuffer(),
            ],
            METADATA_PROGRAM_ID
        );

        // 🧪 Executa o método de adicionar strategy
        const tx = await strategyProgram.methods
            .addStrategy(
                "Moderate",
                "MODERATE",
                "https://example.com/nft.json",
            )
            .accounts({
                bot: botPda,
                metadataProgram: METADATA_PROGRAM_ID,
                metadata: metadataPda,
                signer: user.publicKey,
                tokenMint: strategyTokenAddress,
            })
            .signers([mint])
            .rpc();

        console.log("🚀 Strategy Added TX:", tx);
    });
});