/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_sub_accounts.json`.
 */
export type WebdexSubAccounts = {
  "address": "C4bmi6wrQdtHdoCXdUtFQoHpXhsMiA9uajbE4wFjDssX",
  "metadata": {
    "name": "webdexSubAccounts",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addLiquidity",
      "discriminator": [
        181,
        157,
        89,
        67,
        143,
        182,
        52,
        72
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "subAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
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
          "name": "accountName",
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
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "coinName",
          "type": "string"
        },
        {
          "name": "coinIco",
          "type": "string"
        },
        {
          "name": "coinDecimals",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createSubAccount",
      "discriminator": [
        230,
        148,
        237,
        115,
        126,
        55,
        226,
        172
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "subAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "tracker",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  99,
                  107,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
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
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "getBalance",
      "discriminator": [
        5,
        173,
        180,
        151,
        243,
        81,
        233,
        55
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "subAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "accountName",
          "type": "string"
        },
        {
          "name": "strategyToken",
          "type": "pubkey"
        },
        {
          "name": "coin",
          "type": "pubkey"
        }
      ],
      "returns": {
        "defined": {
          "name": "balanceStrategy"
        }
      }
    },
    {
      "name": "getBalances",
      "discriminator": [
        7,
        176,
        166,
        37,
        177,
        24,
        146,
        160
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "subAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "accountName",
          "type": "string"
        },
        {
          "name": "strategyToken",
          "type": "pubkey"
        }
      ],
      "returns": {
        "vec": {
          "defined": {
            "name": "balanceStrategy"
          }
        }
      }
    },
    {
      "name": "getSubAccountStrategies",
      "discriminator": [
        206,
        224,
        140,
        8,
        122,
        76,
        250,
        125
      ],
      "accounts": [
        {
          "name": "user"
        },
        {
          "name": "subAccount",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "accountName",
          "type": "string"
        }
      ],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "positionLiquidity",
      "discriminator": [
        5,
        2,
        75,
        207,
        182,
        79,
        10,
        13
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "payments",
          "writable": true
        },
        {
          "name": "strategyList",
          "writable": true
        },
        {
          "name": "subAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
              }
            ]
          }
        },
        {
          "name": "temporaryRebalance",
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
                  114,
                  101,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
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
        }
      ],
      "args": [
        {
          "name": "accountName",
          "type": "string"
        },
        {
          "name": "strategyToken",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "i64"
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
      "name": "removeLiquidity",
      "discriminator": [
        80,
        85,
        209,
        72,
        24,
        206,
        177,
        108
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "subAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "accountName",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "togglePause",
      "discriminator": [
        238,
        237,
        206,
        27,
        255,
        95,
        123,
        229
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "subAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "accountName"
              }
            ]
          }
        },
        {
          "name": "strategyBalance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  116,
                  114,
                  97,
                  116,
                  101,
                  103,
                  121,
                  95,
                  98,
                  97,
                  108,
                  97,
                  110,
                  99,
                  101
                ]
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
                "kind": "arg",
                "path": "strategyToken"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "accountName",
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
          "name": "paused",
          "type": "bool"
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
      "name": "temporaryRebalance",
      "discriminator": [
        62,
        159,
        173,
        85,
        87,
        147,
        54,
        113
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
    },
    {
      "name": "userSubAccountTracker",
      "discriminator": [
        26,
        66,
        149,
        140,
        159,
        57,
        235,
        41
      ]
    }
  ],
  "events": [
    {
      "name": "addAndRemoveLiquidityEvent",
      "discriminator": [
        214,
        43,
        244,
        121,
        157,
        226,
        90,
        107
      ]
    },
    {
      "name": "balanceLiquidityEvent",
      "discriminator": [
        110,
        172,
        183,
        118,
        187,
        90,
        2,
        139
      ]
    },
    {
      "name": "changePausedEvent",
      "discriminator": [
        97,
        143,
        220,
        187,
        52,
        2,
        123,
        241
      ]
    },
    {
      "name": "createSubAccountEvent",
      "discriminator": [
        50,
        188,
        230,
        37,
        53,
        212,
        46,
        2
      ]
    },
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
      "name": "strategyNotFound",
      "msg": "Strategy not found"
    },
    {
      "code": 6004,
      "name": "youMustTheWebDexPayments",
      "msg": "You must the WebDexPayments"
    },
    {
      "code": 6005,
      "name": "maxStrategiesReached",
      "msg": "Max strategies reached"
    },
    {
      "code": 6006,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6007,
      "name": "unauthorizedSubAccount",
      "msg": "Você não tem permissão para acessar esta subconta."
    },
    {
      "code": 6008,
      "name": "subAccountNotFound",
      "msg": "SubAccount not found"
    },
    {
      "code": 6009,
      "name": "accountNotLinkedToCurrency",
      "msg": "Account not linked to currency"
    },
    {
      "code": 6010,
      "name": "maxSubAccountsReached",
      "msg": "Max Sub Accounts Reached"
    },
    {
      "code": 6011,
      "name": "invalidSubAccountName",
      "msg": "Invalid Sub Account Name"
    },
    {
      "code": 6012,
      "name": "strategyNotLinked",
      "msg": "Strategy Not Linked"
    },
    {
      "code": 6013,
      "name": "strategyBalanceNotFound",
      "msg": "Strategy Balance Not Found"
    },
    {
      "code": 6014,
      "name": "coinNotLinked",
      "msg": "Coin Not Linked"
    },
    {
      "code": 6015,
      "name": "mustPauseBeforeWithdraw",
      "msg": "Liquidity must be paused before removal"
    },
    {
      "code": 6016,
      "name": "coinNotFound",
      "msg": "Coin not found"
    },
    {
      "code": 6017,
      "name": "coinNotLinkedToStrategy",
      "msg": "Coin not linked to strategy"
    },
    {
      "code": 6018,
      "name": "pauseStateUnchanged",
      "msg": "The paused state must be different"
    },
    {
      "code": 6019,
      "name": "unauthorizedPaymentsCaller",
      "msg": "Only the registered Payments program can call this"
    },
    {
      "code": 6020,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to subtract"
    },
    {
      "code": 6021,
      "name": "duplicateSubAccountName",
      "msg": "Insufficient funds to subtract"
    },
    {
      "code": 6022,
      "name": "invalidCoin",
      "msg": "Invalid Coin"
    },
    {
      "code": 6023,
      "name": "disabledUser",
      "msg": "Disabled User"
    }
  ],
  "types": [
    {
      "name": "addAndRemoveLiquidityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountName",
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
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "increase",
            "type": "bool"
          },
          {
            "name": "isOperation",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "balanceLiquidityEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountName",
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
            "name": "amount",
            "type": "i64"
          },
          {
            "name": "increase",
            "type": "bool"
          },
          {
            "name": "isOperation",
            "type": "bool"
          }
        ]
      }
    },
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
            "name": "voidCollector1",
            "type": "pubkey"
          },
          {
            "name": "voidCollector2",
            "type": "pubkey"
          },
          {
            "name": "voidCollector3",
            "type": "pubkey"
          },
          {
            "name": "voidCollector4",
            "type": "pubkey"
          },
          {
            "name": "feeWithdrawVoid",
            "type": "u64"
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
      "name": "changePausedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "signer",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "accountName",
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
            "name": "paused",
            "type": "bool"
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
      "name": "createSubAccountEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
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
            "name": "accountName",
            "type": "string"
          },
          {
            "name": "details",
            "type": {
              "defined": {
                "name": "positionDetails"
              }
            }
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
            "name": "bot",
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
      "name": "positionDetails",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "strategy",
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
            "type": "i64"
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
            "name": "bot",
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
            "name": "bot",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "pubkey"
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
      "name": "temporaryRebalance",
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
    },
    {
      "name": "userSubAccountTracker",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "count",
            "type": "u8"
          },
          {
            "name": "names",
            "type": {
              "vec": "string"
            }
          }
        ]
      }
    }
  ]
};
