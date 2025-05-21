import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { WebdexFactory } from "../../target/types/webdex_factory";

describe("webdex_strategy", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const user = provider.wallet;

    it("Get Strategies", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE
        const contractAddress = bots[0].account.managerAddress;

        const [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), botPda.toBuffer()],
            strategyProgram.programId
        );

        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies(contractAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

        console.log("📦 Strategies List:", strategies);
    });
});