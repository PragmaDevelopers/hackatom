import { PublicKey } from "@solana/web3.js";

export const sharedState = {
    contractAddress: null as null | PublicKey,
    botPda: null as null | PublicKey,
    paymentsPda: null as null | PublicKey,
    coinToAdd: null as null | PublicKey,
    strategyListPda: null as null | PublicKey,
    strategyTokenAddress: null as null | PublicKey,
    subAccountListPda: null as null | PublicKey,
    subAccountPda: null as null | PublicKey,
    subAccountId: null as null | PublicKey,
    strategyBalancePda: null as null | PublicKey,
    METADATA_PROGRAM_ID: null as null | PublicKey,
};