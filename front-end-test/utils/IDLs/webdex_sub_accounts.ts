/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_sub_accounts.json`.
 */
export type WebdexSubAccounts = {
  "address": "D4KYax2aKb7a3zexPXvkuvn5SWij2SLyftdFgF9N8Eje",
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
          "name": "bot"
        },
        {
          "name": "user"
        },
        {
          "name": "subAccount",
          "writable": true
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
          "name": "strategyToken",
          "type": "pubkey"
        },
        {
          "name": "accountId",
          "type": "string"
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
          "name": "bot"
        },
        {
          "name": "user"
        },
        {
          "name": "subAccountList",
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
                  116,
                  95,
                  108,
                  105,
                  115,
                  116
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
      "name": "findSubAccountIndexById",
      "discriminator": [
        148,
        160,
        82,
        235,
        60,
        6,
        225,
        200
      ],
      "accounts": [
        {
          "name": "subAccountList"
        }
      ],
      "args": [
        {
          "name": "accountId",
          "type": "string"
        }
      ],
      "returns": "i64"
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
          "name": "subAccount"
        },
        {
          "name": "strategyBalance"
        }
      ],
      "args": [
        {
          "name": "accountId",
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
          "name": "subAccount"
        },
        {
          "name": "strategyBalance"
        }
      ],
      "args": [
        {
          "name": "accountId",
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
          "name": "subAccount"
        }
      ],
      "args": [
        {
          "name": "accountId",
          "type": "string"
        }
      ],
      "returns": {
        "vec": "pubkey"
      }
    },
    {
      "name": "getSubAccounts",
      "discriminator": [
        28,
        197,
        164,
        187,
        19,
        229,
        3,
        247
      ],
      "accounts": [
        {
          "name": "subAccountList"
        }
      ],
      "args": [
        {
          "name": "contractAddress",
          "type": "pubkey"
        }
      ],
      "returns": {
        "vec": {
          "defined": {
            "name": "simpleSubAccount"
          }
        }
      }
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
          "name": "bot"
        },
        {
          "name": "user"
        },
        {
          "name": "subAccount"
        },
        {
          "name": "strategyBalance",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "accountId",
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
      "name": "subAccountList",
      "discriminator": [
        38,
        246,
        153,
        110,
        100,
        224,
        230,
        98
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
      "name": "invalidSubAccountId",
      "msg": "Invalid Sub Account Id"
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
    }
  ],
  "types": [
    {
      "name": "balanceLiquidityEvent",
      "type": {
        "kind": "struct",
        "fields": [
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
            "name": "collector1",
            "type": "pubkey"
          },
          {
            "name": "collector2",
            "type": "pubkey"
          },
          {
            "name": "collector3",
            "type": "pubkey"
          },
          {
            "name": "collector4",
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
            "name": "paused",
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
            "name": "signer",
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
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "simpleSubAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subAccountAddress",
            "type": "pubkey"
          },
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "name",
            "type": "string"
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
      "name": "subAccountList",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "subAccounts",
            "type": {
              "vec": {
                "defined": {
                  "name": "simpleSubAccount"
                }
              }
            }
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
