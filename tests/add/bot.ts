import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

describe("webdex_factoty", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const user = provider.wallet;

    // 👉 Variáveis compartilhadas entre os testes
    let contractAddress: PublicKey;
    let botPda: PublicKey;

    it("Add Bot", async () => {
        const strategyAddress = PublicKey.default;
        const tokenPassAddress = PublicKey.default;
        const paymentsAddress = PublicKey.default;
        const fee_withdraw_void = new BN(5);
        const fee_withdraw_network = new BN(15);

        const void_collector_1 = user.publicKey;
        const void_collector_2 = user.publicKey;
        const void_collector_3 = user.publicKey;
        const void_collector_4 = user.publicKey;
        const fee_collector_network_address = user.publicKey;

        // 🔀 contractAddress aleatório
        contractAddress = anchor.web3.Keypair.generate().publicKey;

        [botPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bot"), contractAddress.toBuffer()],
            factoryProgram.programId
        );

        const tx = await factoryProgram.methods
            .addBot(
                contractAddress,
                "Bot 1", // name
                "ONE",         // prefix
                user.publicKey, // owner é quem paga
                void_collector_1, // 
                void_collector_2, // 
                void_collector_3, // 
                void_collector_4, // 
                fee_withdraw_void,
                strategyAddress,
                paymentsAddress,
                tokenPassAddress,
                fee_withdraw_network,
                fee_collector_network_address,
            )
            .accounts({
                signer: user.publicKey, // owner é quem paga
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });

    it("Get Bot Info", async () => {
        const botInfo = await factoryProgram.methods
            .getBotInfo(contractAddress)
            .view(); // view() instead of rpc() for read-only instructions

        console.log("📦 Bot Info:", botInfo);
    });
});