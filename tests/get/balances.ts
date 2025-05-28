import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexManager } from "../../target/types/webdex_manager";
import { BN } from "bn.js";

describe("webdex_sub_accounts", () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const factoryProgram = anchor.workspace.WebdexFactory as Program<WebdexFactory>;
    const strategyProgram = anchor.workspace.WebdexStrategy as Program<WebdexStrategy>;
    const managerProgram = anchor.workspace.WebdexManager as Program<WebdexManager>;
    const subAccountsProgram = anchor.workspace.WebdexSubAccounts as Program<WebdexSubAccounts>;
    const user = provider.wallet;

    it("Get Balances - Liquidity", async () => {
        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies()
            .accounts({
                bot: botPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        const [subAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("sub_account"), userPda.toBuffer(), new BN(0).toArrayLike(Buffer, "le", 8)],
            subAccountsProgram.programId
        );

        const subAccount = await subAccountsProgram.methods
            .getSubAccount()
            .accounts({
                subAccount: subAccountPda,
            })
            .view();

        const result = await subAccountsProgram.methods
            .getBalances(subAccount.id, strategies[0].tokenAddress)
            .accounts({
                user: userPda,
                subAccount: subAccountPda,
            })
            .view();

        const formattedResult = result.map(data => {
            return {
                ...data,
                amount: data.amount.toNumber()
            }
        }) // Convertendo BN pra Number

        console.log("BalanceStrategy:", formattedResult);
    });
});