import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexNetwork } from "../../../target/types/webdex_network";
import { PublicKey } from "@solana/web3.js";
import { WebdexFactory } from "../../../target/types/webdex_factory";
import { WebdexStrategy } from "../../../target/types/webdex_strategy";
import { WebdexPayments } from "../../../target/types/webdex_payments";
import { WebdexManager } from "../../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../../target/types/webdex_sub_accounts";

describe("webdex_network", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const paymentsProgram = anchor.workspace.WebdexPayments as Program<WebdexPayments>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const networkProgram = anchor.workspace.WebdexNetwork as Program<WebdexNetwork>;
    const user = provider.wallet;

    it("Get Balance - Network", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

        const bots = await factoryProgram.account.bot.all();

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        const [balanceInfoPda] = await PublicKey.findProgramAddressSync(
            [Buffer.from('balance_info'), bots[0].account.managerAddress.toBuffer(), userPda.toBuffer(), usdtMint.pubkey.toBuffer()],
            networkProgram.programId
        );

        const balanceData = await networkProgram.methods
            .getBalance()
            .accounts({
                balanceInfo: balanceInfoPda,
            })
            .view();

        console.log("💵 balance:", balanceData.balance.toNumber());
    });
});