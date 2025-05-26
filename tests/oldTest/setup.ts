import { PublicKey } from "@solana/web3.js";
import { writeFileSync, readFileSync, existsSync } from "fs";
import path from "path";

// Caminho padrão para salvar o estado
const STATE_PATH = path.resolve(__dirname, "sharedState.json");

// Estrutura de estado compartilhado
export const sharedState = {
    contractAddress: null as null | PublicKey,
    botsPda: [] as PublicKey[],
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
        sol: {
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
    subAccountId: null as null | string,
    subAccountName: null as null | string,
    strategyBalancePda: null as null | PublicKey,
    METADATA_PROGRAM_ID: null as null | PublicKey,
    lpTokenPda: null as null | PublicKey,
    userLpTokenAccountAta: null as null | PublicKey,
    lpMintAuthority: null as null | PublicKey,
    userUsdtAccount: null as null | PublicKey,
    vaultUsdtAccount: null as null | PublicKey,
    temporaryFeePda: null as null | PublicKey,
};

// Utilitários para conversão
function publicKeyToString(pk: PublicKey | null): string | null {
    return pk ? pk.toBase58() : null;
}

function stringToPublicKey(str: string | null): PublicKey | null {
    return str ? new PublicKey(str) : null;
}

// Salvar o estado no disco
export function saveSharedStateToFile(filePath = STATE_PATH) {
    const stateToSave = JSON.parse(JSON.stringify(sharedState, (key, value) => {
        if (value instanceof PublicKey) return value.toBase58();
        if (Array.isArray(value) && value.length && value[0] instanceof PublicKey) {
            return value.map((v: PublicKey) => v.toBase58());
        }
        return value;
    }));

    writeFileSync(filePath, JSON.stringify(stateToSave, null, 2), "utf-8");
}

// Carregar estado do disco
export function loadSharedStateFromFile(filePath = STATE_PATH) {
    if (!existsSync(filePath)) return;

    const raw = JSON.parse(readFileSync(filePath, "utf-8"));

    sharedState.contractAddress = stringToPublicKey(raw.contractAddress);
    sharedState.botsPda = Array.isArray(raw.botsPda)
        ? raw.botsPda.map(stringToPublicKey)
        : [];

    sharedState.feeCollectorNetworkAddress = stringToPublicKey(raw.feeCollectorNetworkAddress);
    sharedState.paymentsPda = stringToPublicKey(raw.paymentsPda);

    ["usdt", "webdex", "sol"].forEach((token) => {
        sharedState.coin[token].pubkey = stringToPublicKey(raw.coin[token].pubkey);
        sharedState.coin[token].name = raw.coin[token].name;
        sharedState.coin[token].symbol = raw.coin[token].symbol;
        sharedState.coin[token].decimals = raw.coin[token].decimals;
    });

    sharedState.strategyListPda = stringToPublicKey(raw.strategyListPda);
    sharedState.strategyTokenAddress = stringToPublicKey(raw.strategyTokenAddress);
    sharedState.userPda = stringToPublicKey(raw.userPda);
    sharedState.subAccountListPda = stringToPublicKey(raw.subAccountListPda);
    sharedState.balanceInfoPda = stringToPublicKey(raw.balanceInfoPda);
    sharedState.subAccountPda = stringToPublicKey(raw.subAccountPda);
    sharedState.subAccountId = raw.subAccountId;
    sharedState.subAccountName = raw.subAccountName;
    sharedState.strategyBalancePda = stringToPublicKey(raw.strategyBalancePda);
    sharedState.METADATA_PROGRAM_ID = stringToPublicKey(raw.METADATA_PROGRAM_ID);
    sharedState.lpTokenPda = stringToPublicKey(raw.lpTokenPda);
    sharedState.userLpTokenAccountAta = stringToPublicKey(raw.userLpTokenAccountAta);
    sharedState.lpMintAuthority = stringToPublicKey(raw.lpMintAuthority);
    sharedState.userUsdtAccount = stringToPublicKey(raw.userUsdtAccount);
    sharedState.vaultUsdtAccount = stringToPublicKey(raw.vaultUsdtAccount);
    sharedState.temporaryFeePda = stringToPublicKey(raw.temporaryFeePda);
}