/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_payments.json`.
 */
export type WebdexPayments = {
  "address": "AVHdHmVQS5r9s4rq8D5XdkVmD97hXkvGzpeau2idxkL1",
  "metadata": {
    "name": "webdexPayments",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addFeeTiers",
      "discriminator": [
        44,
        61,
        29,
        131,
        243,
        123,
        223,
        236
      ],
      "accounts": [
        {
          "name": "payments",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "contractAddress",
          "type": "pubkey"
        },
        {
          "name": "newFeeTiers",
          "type": {
            "vec": {
              "defined": {
                "name": "feeTier"
              }
            }
          }
        }
      ]
    },
    {
      "name": "currencyAllow",
      "discriminator": [
        179,
        10,
        139,
        180,
        236,
        201,
        238,
        71
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "payments",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "bot"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "coinPubkey",
          "type": "pubkey"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "currencyRevoke",
      "discriminator": [
        84,
        136,
        1,
        71,
        226,
        160,
        156,
        83
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "payments",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  121,
                  109,
                  101,
                  110,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "bot"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "coinPubkey",
          "type": "pubkey"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "getFeeTiers",
      "discriminator": [
        201,
        117,
        217,
        106,
        185,
        132,
        20,
        175
      ],
      "accounts": [
        {
          "name": "payments"
        }
      ],
      "args": [],
      "returns": {
        "vec": {
          "defined": {
            "name": "feeTier"
          }
        }
      }
    },
    {
      "name": "openPosition",
      "discriminator": [
        135,
        128,
        47,
        77,
        15,
        152,
        240,
        49
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true
        },
        {
          "name": "payments"
        },
        {
          "name": "strategyList"
        },
        {
          "name": "subAccount",
          "writable": true
        },
        {
          "name": "strategyBalance",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "temporaryFeeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  101,
                  109,
                  112,
                  111,
                  114,
                  97,
                  114,
                  121,
                  95,
                  102,
                  101,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "bot"
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "subAccount"
              },
              {
                "kind": "account",
                "path": "strategyBalance"
              },
              {
                "kind": "account",
                "path": "payments"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "subAccountProgram",
          "address": "9tgvAbnsLUZ78v5C8HzaYVZhTuPk5JqX9G2tSVjdVMYL"
        }
      ],
      "args": [
        {
          "name": "decimals",
          "type": "u8"
        },
        {
          "name": "accountId",
          "type": "string"
        },
        {
          "name": "strategyToken",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "coin",
          "type": "pubkey"
        },
        {
          "name": "gas",
          "type": "u64"
        },
        {
          "name": "currrencys",
          "type": {
            "vec": {
              "defined": {
                "name": "currencys"
              }
            }
          }
        }
      ]
    },
    {
      "name": "removeCoin",
      "discriminator": [
        187,
        229,
        187,
        174,
        213,
        190,
        162,
        142
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "payments",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "coin",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bot",
      "discriminator": [
        122,
        136,
        3,
        241,
        243,
        138,
        195,
        52
      ]
    },
    {
      "name": "feeAccount",
      "discriminator": [
        137,
        191,
        201,
        34,
        168,
        222,
        43,
        138
      ]
    },
    {
      "name": "payments",
      "discriminator": [
        172,
        186,
        73,
        99,
        243,
        28,
        103,
        34
      ]
    },
    {
      "name": "strategyBalanceList",
      "discriminator": [
        101,
        190,
        24,
        107,
        186,
        122,
        101,
        70
      ]
    },
    {
      "name": "strategyList",
      "discriminator": [
        128,
        85,
        53,
        230,
        250,
        80,
        204,
        252
      ]
    },
    {
      "name": "subAccount",
      "discriminator": [
        227,
        47,
        166,
        42,
        242,
        171,
        32,
        114
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    }
  ],
  "events": [
    {
      "name": "openPositionEvent",
      "discriminator": [
        83,
        43,
        164,
        147,
        169,
        87,
        81,
        172
      ]
    },
    {
      "name": "traderEvent",
      "discriminator": [
        54,
        131,
        40,
        86,
        169,
        250,
        106,
        144
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidContractAddress",
      "msg": "O endereço do contrato fornecido é inválido."
    },
    {
      "code": 6001,
      "name": "botNotFound",
      "msg": "Bot not found"
    },
    {
      "code": 6002,
      "name": "botAlreadyRegistered",
      "msg": "Bot already registered"
    },
    {
      "code": 6003,
      "name": "coinNotFound",
      "msg": "Coin not found"
    },
    {
      "code": 6004,
      "name": "strategyNotFound",
      "msg": "Strategy not found"
    },
    {
      "code": 6005,
      "name": "coinAlreadyExists",
      "msg": "Coin already exists"
    },
    {
      "code": 6006,
      "name": "maxStrategiesReached",
      "msg": "Max strategies reached"
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6008,
      "name": "unauthorizedSubAccount",
      "msg": "Você não tem permissão para acessar esta subconta."
    },
    {
      "code": 6009,
      "name": "subAccountNotFound",
      "msg": "SubAccount not found"
    },
    {
      "code": 6010,
      "name": "accountNotLinkedToCurrency",
      "msg": "Account not linked to currency"
    },
    {
      "code": 6011,
      "name": "strategyNotLinked",
      "msg": "Strategy Not Linked"
    },
    {
      "code": 6012,
      "name": "strategyBalanceNotFound",
      "msg": "Strategy Balance Not Found"
    },
    {
      "code": 6013,
      "name": "coinNotLinked",
      "msg": "Coin Not Linked"
    },
    {
      "code": 6014,
      "name": "statusMustBeDifferent",
      "msg": "Status Must Be Different"
    },
    {
      "code": 6015,
      "name": "coinNotRegistered",
      "msg": "Coin Not Registered"
    },
    {
      "code": 6016,
      "name": "invalidCoin",
      "msg": "Invalid Coin"
    },
    {
      "code": 6017,
      "name": "invalidAuthority",
      "msg": "Invalid Coin"
    }
  ],
  "types": [
    {
      "name": "balanceStrategy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "token",
            "type": "pubkey"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "ico",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "status",
            "type": "bool"
          },
          {
            "name": "paused",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "bot",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "prefix",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "managerAddress",
            "type": "pubkey"
          },
          {
            "name": "strategyAddress",
            "type": "pubkey"
          },
          {
            "name": "subAccountAddress",
            "type": "pubkey"
          },
          {
            "name": "paymentsAddress",
            "type": "pubkey"
          },
          {
            "name": "tokenPassAddress",
            "type": "pubkey"
          },
          {
            "name": "feeWithdrawNetwork",
            "type": "u64"
          },
          {
            "name": "feeCollectorNetworkAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "coinData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pubkey",
            "type": "pubkey"
          },
          {
            "name": "coin",
            "type": {
              "defined": {
                "name": "coins"
              }
            }
          }
        ]
      }
    },
    {
      "name": "coins",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "decimals",
            "type": "u8"
          },
          {
            "name": "status",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "currencys",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "feeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "feeTier",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "limit",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "openPositionEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "strategyToken",
            "type": "pubkey"
          },
          {
            "name": "coin",
            "type": "pubkey"
          },
          {
            "name": "oldBalance",
            "type": "u64"
          },
          {
            "name": "fee",
            "type": "u64"
          },
          {
            "name": "gas",
            "type": "u64"
          },
          {
            "name": "profit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "payments",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "feeTiers",
            "type": {
              "vec": {
                "defined": {
                  "name": "feeTier"
                }
              }
            }
          },
          {
            "name": "coins",
            "type": {
              "vec": {
                "defined": {
                  "name": "coinData"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "strategy",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "strategyBalanceList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "strategyToken",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": "bool"
          },
          {
            "name": "listCoins",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "balance",
            "type": {
              "vec": {
                "defined": {
                  "name": "balanceStrategy"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "strategyList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "strategies",
            "type": {
              "vec": {
                "defined": {
                  "name": "strategy"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "subAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "listStrategies",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "strategies",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "traderEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "manager",
            "type": "pubkey"
          },
          {
            "name": "gasBalance",
            "type": "u64"
          },
          {
            "name": "passBalance",
            "type": "u64"
          },
          {
            "name": "status",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
