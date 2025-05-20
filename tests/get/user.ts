import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";
import { PublicKey } from "@solana/web3.js";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    // Deriva o PDA do user
    const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), user.publicKey.toBuffer()],
        managerProgram.programId
    );

    it("Get User", async () => {
        // REGISTRANDO USER
        const user = await managerProgram.methods
            .getInfoUser()
            .accounts({
                user: userPda,
            })
            .view();

        console.log("📦 User:", user);
    });
});