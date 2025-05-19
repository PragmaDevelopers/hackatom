import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { PublicKey } from "@solana/web3.js";
import { sharedState } from "../setup";
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
        const subAccountAddress = PublicKey.default;
        const tokenPassAddress = PublicKey.default;
        const paymentsAddress = PublicKey.default;
        const fee_withdraw_network = new BN(0.06);

        const fee_collector_network_address = user.publicKey;
        sharedState.feeCollectorNetworkAddress = fee_collector_network_address;

        // 🔀 contractAddress aleatório
        contractAddress = anchor.web3.Keypair.generate().publicKey;
        sharedState.contractAddress = contractAddress;

        [botPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bot"), contractAddress.toBuffer()],
            factoryProgram.programId
        );
        sharedState.botPda = botPda;

        const tx = await factoryProgram.methods
            .addBot(
                "Bot 1", // name
                "ONE",         // prefix
                user.publicKey, // owner é quem paga
                contractAddress,
                strategyAddress,
                subAccountAddress,
                paymentsAddress,
                tokenPassAddress,
                fee_withdraw_network,
                fee_collector_network_address,
            )
            .accounts({
                signer: user.publicKey, // owner é quem paga
                managerAddress: contractAddress,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });

    it("Get Bot Info", async () => {
        const botInfo = await factoryProgram.methods
            .getBotInfo(contractAddress)
            .accounts({
                bot: botPda,
            })
            .view(); // view() instead of rpc() for read-only instructions

        console.log("📦 Bot Info:", botInfo);
    });
});