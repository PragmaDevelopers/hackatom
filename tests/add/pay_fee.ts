import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { WebdexNetwork } from "../../target/types/webdex_network";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import {
    fetchMetadata,
    findMetadataPda,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { fetchMint } from "@metaplex-foundation/mpl-toolbox";
import { publicKey } from "@metaplex-foundation/umi";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { WebdexFactory } from "../../target/types/webdex_factory";
import { WebdexStrategy } from "../../target/types/webdex_strategy";
import { WebdexPayments } from "../../target/types/webdex_payments";
import { WebdexManager } from "../../target/types/webdex_manager";
import { WebdexSubAccounts } from "../../target/types/webdex_sub_accounts";

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

    it("Pay Fee", async () => {
        const payments = await paymentsProgram.account.payments.all();
        const usdtMint = payments[0].account.coins.find(token => token.coin.symbol == "USDT");

        const bots = await factoryProgram.account.bot.all();
        const botPda = bots[0].publicKey; // BOT 1 - ONE

        const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), user.publicKey.toBuffer()],
            managerProgram.programId
        );

        const [strategyListPda] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_list"), botPda.toBuffer()],
            strategyProgram.programId
        );

        // Chamada da função de leitura
        const strategies = await strategyProgram.methods
            .getStrategies(bots[0].account.managerAddress)
            .accounts({
                strategyList: strategyListPda,
            })
            .view(); // <- importante: view() para funções que retornam valores

        // Chamada da função get_sub_accounts
        const subAccounts = await subAccountsProgram.account.subAccount.all([
            {
                memcmp: {
                    offset: 8 + 32, // pula discriminator + bot
                    bytes: userPda.toBase58(),
                },
            },
        ]);

        const subAccountPda = subAccounts[0].publicKey;

        const [strategyBalancePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("strategy_balance"), userPda.toBuffer(), subAccountPda.toBuffer(), strategies[0].tokenAddress.toBuffer()],
            subAccountsProgram.programId
        );

        const balance = await subAccountsProgram.methods
            .getBalance(subAccounts[0].account.id, strategies[0].tokenAddress, usdtMint.pubkey)
            .accounts({
                subAccount: subAccountPda,
                strategyBalance: strategyBalancePda,
            })
            .view();

        const tx = await networkProgram.methods
            .payFee(
                bots[0].account.managerAddress,
                usdtMint.pubkey,
                new BN(balance.amount),
            )
            .accounts({
                bot: botPda,
                user: userPda,
                signer: user.publicKey,
            })
            .rpc();

        console.log("✅ Transaction signature:", tx);
    });
});