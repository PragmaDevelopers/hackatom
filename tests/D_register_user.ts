import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../target/types/webdex_manager";
import { PublicKey } from "@solana/web3.js";
import { sharedState } from "./setup";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Register User", async () => {
        // Deriva o PDA do manager
        const [managerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("manager"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        // REGISTRANDO MANAGER
        await managerProgram.methods
            .registerManager(sharedState.contractAddress)
            .accounts({
                signer: user.publicKey,
            })
            .rpc();

        // Deriva o PDA do user
        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );
        sharedState.userPda = userPda;

        // REGISTRANDO USER
        const tx = await managerProgram.methods
            .register(user.publicKey)
            .accounts({
                signer: user.publicKey,
                manager: managerPda,
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });

    it("Get User", async () => {
        // REGISTRANDO USER
        const user = await managerProgram.methods
            .getInfoUser()
            .accounts({
                user: sharedState.userPda,
            })
            .view();

        console.log("📦 User:", user);
    });
});