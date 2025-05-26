import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_factoty", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const user = provider.wallet;

    it("Remove Bot All", async () => {
        const bots = await factoryProgram.account.bot.all();
        for (const bot of bots) {
            try {
                const tx = await factoryProgram.methods
                    .removeBot(bot.account.managerAddress)
                    .accounts({
                        signer: user.publicKey,
                    })
                    .rpc();

                console.log("🗑️ Bot removed. Tx:", tx);

                // Verifica que foi fechado (ou o fetch falha)
                try {
                    const result = await factoryProgram.account.bot.fetch(bot.publicKey);
                    console.log("⚠️ Ainda existe:", result);
                } catch (err) {
                    console.log("✅ Conta do bot foi fechada com sucesso");
                }
            } catch (err) {
                console.error("❌ Falha ao remover bot:", bot.publicKey.toBase58(), err);
            }
        }
    });
});