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

    it("Get Bot Info", async () => {
        const bots = await factoryProgram.account.bot.all();

        console.log("📦 Bot Info:", bots);
    });
});