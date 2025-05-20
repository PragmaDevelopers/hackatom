import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";
import { PublicKey } from "@solana/web3.js";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    const manager = PublicKey.default;

    it("Register User", async () => {
        // REGISTRANDO USER
        const tx = await managerProgram.methods
            .register()
            .accounts({
                signer: user.publicKey,
                manager: manager == PublicKey.default ? managerProgram.programId : manager,
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });
});