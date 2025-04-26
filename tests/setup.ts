import { PublicKey } from "@solana/web3.js";

export const sharedState = {
    contractAddress: null as null | PublicKey,
    botPda: null as null | PublicKey,
    feeCollectorNetworkAddress: null as null | PublicKey,
    paymentsPda: null as null | PublicKey,
    coin: {
        usdt: {
            pubkey: null as null | PublicKey,
            name: null as null | string,
            symbol: null as null | string,
            decimals: null as null | number,
        },
        webdex: {
            pubkey: null as null | PublicKey,
            name: null as null | string,
            symbol: null as null | string,
            decimals: null as null | number,
        },
        pol: {
            pubkey: null as null | PublicKey,
            name: null as null | string,
            symbol: null as null | string,
            decimals: null as null | number,
        },
    },
    strategyListPda: null as null | PublicKey,
    strategyTokenAddress: null as null | PublicKey,
    userPda: null as null | PublicKey,
    subAccountListPda: null as null | PublicKey,
    balanceInfoPda: null as null | PublicKey,
    subAccountPda: null as null | PublicKey,
    subAccountId: null as null | PublicKey,
    strategyBalancePda: null as null | PublicKey,
    METADATA_PROGRAM_ID: null as null | PublicKey,
    lpTokenPda: null as null | PublicKey,
    userLpTokenAccountAta: null as null | PublicKey,
    lpMintAuthority: null as null | PublicKey,
};