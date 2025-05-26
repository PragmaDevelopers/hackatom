import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";
import { PublicKey } from "@solana/web3.js";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexManager } from "../../target/types/webdex_manager";

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

        // Chamada da função get_sub_accounts
        const subAccounts = await subAccountsProgram.account.subAccount.all([
            {
                memcmp: {
                    offset: 8 + 32, // pula discriminator + bot
                    bytes: userPda.toBase58(),
                },
            },
        ]);

        const result = await subAccountsProgram.methods
            .getBalances(subAccounts[0].account.name, strategies[0].tokenAddress)
            .accounts({
                user: userPda,
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