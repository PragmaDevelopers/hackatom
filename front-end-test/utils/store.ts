import { create } from "zustand";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@solana/wallet-adapter-react";

type CoinInfo = {
    pubkey: PublicKey | null;
    name: string | null;
    symbol: string | null;
    decimals: number | null;
};

type UserData = {
    wallet: Wallet | null;
    publicKey: PublicKey | null;
};

export type SharedState = {
    contractAddress: PublicKey | null;
    botPda: PublicKey | null;
    feeCollectorNetworkAddress: PublicKey | null;
    paymentsPda: PublicKey | null;
    coin: {
        usdt: CoinInfo;
        webdex: CoinInfo;
        pol: CoinInfo;
    };
    strategyListPda: PublicKey | null;
    strategyTokenAddress: PublicKey | null;
    userPda: PublicKey | null;
    subAccountListPda: PublicKey | null;
    balanceInfoPda: PublicKey | null;
    subAccountPda: PublicKey | null;
    subAccountId: PublicKey | null;
    subAccountName: string | null;
    strategyBalancePda: PublicKey | null;
    METADATA_PROGRAM_ID: PublicKey | null;
    lpTokenPda: PublicKey | null;
    userLpTokenAccountAta: PublicKey | null;
    lpMintAuthority: PublicKey | null;
    userUsdtAccount: PublicKey | null;
    vaultUsdtAccount: PublicKey | null;
    temporaryFeePda: PublicKey | null;
    userData: UserData;
};

interface SharedStateStore {
    sharedState: SharedState;
    // General setters
    setSharedState: (state: Partial<SharedState>) => void;
    resetSharedState: () => void;

    // Top-level field setters
    setContractAddress: (value: PublicKey | null) => void;
    setBotPda: (value: PublicKey | null) => void;
    setFeeCollectorNetworkAddress: (value: PublicKey | null) => void;
    setPaymentsPda: (value: PublicKey | null) => void;
    setStrategyListPda: (value: PublicKey | null) => void;
    setStrategyTokenAddress: (value: PublicKey | null) => void;
    setUserPda: (value: PublicKey | null) => void;
    setSubAccountListPda: (value: PublicKey | null) => void;
    setBalanceInfoPda: (value: PublicKey | null) => void;
    setSubAccountPda: (value: PublicKey | null) => void;
    setSubAccountId: (value: PublicKey | null) => void;
    setSubAccountName: (value: string | null) => void;
    setStrategyBalancePda: (value: PublicKey | null) => void;
    setMetadataProgramId: (value: PublicKey | null) => void;
    setLpTokenPda: (value: PublicKey | null) => void;
    setUserLpTokenAccountAta: (value: PublicKey | null) => void;
    setLpMintAuthority: (value: PublicKey | null) => void;
    setUserUsdtAccount: (value: PublicKey | null) => void;
    setVaultUsdtAccount: (value: PublicKey | null) => void;
    setTemporaryFeePda: (value: PublicKey | null) => void;

    // UserData field setters
    setUserData: (userData: UserData) => void;
    setUserDataWallet: (wallet: Wallet | null) => void;
    setUserDataPublicKey: (publicKey: PublicKey | null) => void;

    // Coin field setters
    setCoin: (coin: SharedState['coin']) => void;

    // Individual coin setters
    setUsdtCoin: (usdt: CoinInfo) => void;
    setWebdexCoin: (webdex: CoinInfo) => void;
    setPolCoin: (pol: CoinInfo) => void;

    // Individual coin field setters
    setUsdtPubkey: (pubkey: PublicKey | null) => void;
    setUsdtName: (name: string | null) => void;
    setUsdtSymbol: (symbol: string | null) => void;
    setUsdtDecimals: (decimals: number | null) => void;

    setWebdexPubkey: (pubkey: PublicKey | null) => void;
    setWebdexName: (name: string | null) => void;
    setWebdexSymbol: (symbol: string | null) => void;
    setWebdexDecimals: (decimals: number | null) => void;

    setPolPubkey: (pubkey: PublicKey | null) => void;
    setPolName: (name: string | null) => void;
    setPolSymbol: (symbol: string | null) => void;
    setPolDecimals: (decimals: number | null) => void;
}

export const InitialSharedState: SharedState = {
    contractAddress: null,
    botPda: null,
    feeCollectorNetworkAddress: null,
    paymentsPda: null,
    coin: {
        usdt: {
            pubkey: null,
            name: null,
            symbol: null,
            decimals: null,
        },
        webdex: {
            pubkey: null,
            name: null,
            symbol: null,
            decimals: null,
        },
        pol: {
            pubkey: null,
            name: null,
            symbol: null,
            decimals: null,
        },
    },
    strategyListPda: null,
    strategyTokenAddress: null,
    userPda: null,
    subAccountListPda: null,
    balanceInfoPda: null,
    subAccountPda: null,
    subAccountId: null,
    subAccountName: null,
    strategyBalancePda: null,
    METADATA_PROGRAM_ID: null,
    lpTokenPda: null,
    userLpTokenAccountAta: null,
    lpMintAuthority: null,
    userUsdtAccount: null,
    vaultUsdtAccount: null,
    temporaryFeePda: null,
    userData: {
        publicKey: null,
        wallet: null,
    }
};

export const useSharedStateStore = create<SharedStateStore>((set) => ({
    sharedState: InitialSharedState,

    // General setters
    setSharedState: (state) =>
        set((current) => ({
            sharedState: {
                ...current.sharedState,
                ...state,
            },
        })),

    resetSharedState: () => set({ sharedState: InitialSharedState }),

    // Top-level field setters
    setContractAddress: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                contractAddress: value
            }
        })),

    setBotPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                botPda: value
            }
        })),

    setFeeCollectorNetworkAddress: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                feeCollectorNetworkAddress: value
            }
        })),

    setPaymentsPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                paymentsPda: value
            }
        })),

    setStrategyListPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                strategyListPda: value
            }
        })),

    setStrategyTokenAddress: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                strategyTokenAddress: value
            }
        })),

    setUserPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userPda: value
            }
        })),

    setSubAccountListPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                subAccountListPda: value
            }
        })),

    setBalanceInfoPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                balanceInfoPda: value
            }
        })),

    setSubAccountPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                subAccountPda: value
            }
        })),

    setSubAccountId: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                subAccountId: value
            }
        })),

    setSubAccountName: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                subAccountName: value
            }
        })),

    setStrategyBalancePda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                strategyBalancePda: value
            }
        })),

    setMetadataProgramId: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                METADATA_PROGRAM_ID: value
            }
        })),

    setLpTokenPda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                lpTokenPda: value
            }
        })),

    setUserLpTokenAccountAta: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userLpTokenAccountAta: value
            }
        })),

    setLpMintAuthority: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                lpMintAuthority: value
            }
        })),

    setUserUsdtAccount: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userUsdtAccount: value
            }
        })),

    setVaultUsdtAccount: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                vaultUsdtAccount: value
            }
        })),

    setTemporaryFeePda: (value) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                temporaryFeePda: value
            }
        })),

    // UserData field setters
    setUserData: (userData) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userData
            }
        })),

    setUserDataWallet: (wallet) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userData: {
                    ...state.sharedState.userData,
                    wallet
                }
            }
        })),

    setUserDataPublicKey: (publicKey) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                userData: {
                    ...state.sharedState.userData,
                    publicKey
                }
            }
        })),

    // Coin field setters
    setCoin: (coin) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin
            }
        })),

    // Individual coin setters
    setUsdtCoin: (usdt) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    usdt
                }
            }
        })),

    setWebdexCoin: (webdex) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    webdex
                }
            }
        })),

    setPolCoin: (pol) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    pol
                }
            }
        })),

    // Individual coin field setters
    setUsdtPubkey: (pubkey) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    usdt: {
                        ...state.sharedState.coin.usdt,
                        pubkey
                    }
                }
            }
        })),

    setUsdtName: (name) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    usdt: {
                        ...state.sharedState.coin.usdt,
                        name
                    }
                }
            }
        })),

    setUsdtSymbol: (symbol) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    usdt: {
                        ...state.sharedState.coin.usdt,
                        symbol
                    }
                }
            }
        })),

    setUsdtDecimals: (decimals) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    usdt: {
                        ...state.sharedState.coin.usdt,
                        decimals
                    }
                }
            }
        })),

    setWebdexPubkey: (pubkey) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    webdex: {
                        ...state.sharedState.coin.webdex,
                        pubkey
                    }
                }
            }
        })),

    setWebdexName: (name) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    webdex: {
                        ...state.sharedState.coin.webdex,
                        name
                    }
                }
            }
        })),

    setWebdexSymbol: (symbol) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    webdex: {
                        ...state.sharedState.coin.webdex,
                        symbol
                    }
                }
            }
        })),

    setWebdexDecimals: (decimals) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    webdex: {
                        ...state.sharedState.coin.webdex,
                        decimals
                    }
                }
            }
        })),

    setPolPubkey: (pubkey) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    pol: {
                        ...state.sharedState.coin.pol,
                        pubkey
                    }
                }
            }
        })),

    setPolName: (name) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    pol: {
                        ...state.sharedState.coin.pol,
                        name
                    }
                }
            }
        })),

    setPolSymbol: (symbol) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    pol: {
                        ...state.sharedState.coin.pol,
                        symbol
                    }
                }
            }
        })),

    setPolDecimals: (decimals) =>
        set((state) => ({
            sharedState: {
                ...state.sharedState,
                coin: {
                    ...state.sharedState.coin,
                    pol: {
                        ...state.sharedState.coin.pol,
                        decimals
                    }
                }
            }
        })),
}));