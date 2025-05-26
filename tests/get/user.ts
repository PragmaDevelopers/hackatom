import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexManager } from "../../target/types/webdex_manager";

describe("webdex_manager", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const user = provider.wallet;

    it("Get User", async () => {
        // REGISTRANDO USER
        const userInfo = await managerProgram.methods
            .getInfoUser()
            .accounts({
                signer: user.publicKey,
            })
            .view();

        userInfo.gasBalance = userInfo.gasBalance.toNumber();
        userInfo.passBalance = userInfo.passBalance.toNumber();

        console.log("📦 User:", userInfo);
    });
});