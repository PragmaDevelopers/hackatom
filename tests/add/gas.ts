import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";
import { BN } from "bn.js";
import { PublicKey } from "@solana/web3.js";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Add Gas", async () => {
        const solAmout = new BN(5_000_000_000);

        const tx = await managerProgram.methods
            .addGas(solAmout)
            .accounts({
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transaction:", tx);
    });
});