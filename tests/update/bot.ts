import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { PublicKey } from "@solana/web3.js";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";

describe("webdex_factoty", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Update Bot Info", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), botPda.toBuffer()],
            strategyProgram.programId
        );

        const [paymentsPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("payments"), botPda.toBuffer()],
            paymentsProgram.programId
        );

        const tx = await factoryProgram.methods
            .updateBot(
                bots[0].account.managerAddress,
                strategyListPda,
                paymentsPda,
            )
            .accounts({
                signer: user.publicKey,
            })
            .rpc();

        console.log("🔄 Updated Bot. Tx:", tx);
    });
});