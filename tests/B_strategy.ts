import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexStrategy } from "../target/types/webdex_strategy";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { sharedState } from "./setup";

describe("webdex_strategy", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const METADATA_PROGRAM_ID = new PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" // Metaplex Metadata Program
    );
    sharedState.METADATA_PROGRAM_ID = METADATA_PROGRAM_ID;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let strategyListPda: PublicKey;
    let strategyTokenAddress: PublicKey;

    it("Add Strategy", async () => {
        [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), sharedState.botPda.toBuffer()],
            strategyProgram.programId
        );
        sharedState.strategyListPda = strategyListPda;

        // 🎨 Criar uma nova conta mint (NFT)
        const mint = anchor.web3.Keypair.generate();
        strategyTokenAddress = mint.publicKey;
        sharedState.strategyTokenAddress = strategyTokenAddress;

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
                sharedState.contractAddress
            )
            .accounts({
                bot: sharedState.botPda,
                tokenAddress: strategyTokenAddress,
                metadataProgram: METADATA_PROGRAM_ID,
                metadata: metadataPda,
                signer: user.publicKey,
                tokenAuthority: user.publicKey,
                tokenMint: strategyTokenAddress,
            })
            .signers([mint])
            .rpc();

        console.log("🚀 Strategy Added TX:", tx);
    });

    it("Get Strategies", async () => {
        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies(sharedState.contractAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

        console.log("📦 Strategies List:", strategies);

        // Verificação básica (ajuste conforme seu cenário)
        expect(strategies.length).to.be.greaterThan(0);
        expect(strategies[0]).to.have.all.keys("name", "tokenAddress", "isActive");
    });

    it("Update Strategy Status - Mudando para False", async () => {
        const strategyList = await strategyProgram.account.strategyList.fetch(strategyListPda);
        const tokenAddress = strategyList.strategies[0].tokenAddress;

        const tx = await strategyProgram.methods
            .updateStrategyStatus(sharedState.contractAddress, tokenAddress, false)
            .accounts({
                bot: sharedState.botPda,
                strategyList: strategyListPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🔄 Updated Strategy Status TX:", tx);
    });

    it("Find Strategy by Token Address", async () => {
        const foundStrategy = await strategyProgram.methods
            .findStrategy(sharedState.contractAddress, strategyTokenAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view();

        console.log("🔍 Strategy Found:", foundStrategy);
    });

    it("Update Strategy Status - Mudando para True", async () => {
        const strategyList = await strategyProgram.account.strategyList.fetch(strategyListPda);
        const tokenAddress = strategyList.strategies[0].tokenAddress;

        const tx = await strategyProgram.methods
            .updateStrategyStatus(sharedState.contractAddress, tokenAddress, true)
            .accounts({
                bot: sharedState.botPda,
                strategyList: strategyListPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("🔄 Updated Strategy Status TX:", tx);
    });
});