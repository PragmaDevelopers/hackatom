/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_strategy.json`.
 */
export type WebdexStrategy = {
  "address": "418sMdM3mq48AdsMgNpt6gNp6q3vNNcyUB3THzqQmSgH",
  "metadata": {
    "name": "webdexStrategy",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addStrategy",
      "discriminator": [
        64,
        123,
        127,
        227,
        192,
        234,
        198,
        20
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "strategyList",
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
          "name": "tokenMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenAddress"
        },
        {
          "name": "metadataProgram"
        },
        {
          "name": "metadata",
          "writable": true
        },
        {
          "name": "tokenAuthority",
          "writable": true,
          "signer": true
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
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "contractAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "deleteStrategy",
      "discriminator": [
        170,
        252,
        31,
        143,
        231,
        7,
        212,
        159
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "strategyList",
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
          "name": "tokenAddress",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "findStrategy",
      "discriminator": [
        36,
        220,
        180,
        220,
        15,
        202,
        88,
        185
      ],
      "accounts": [
        {
          "name": "strategyList"
        }
      ],
      "args": [
        {
          "name": "contractAddress",
          "type": "pubkey"
        },
        {
          "name": "tokenAddress",
          "type": "pubkey"
        }
      ],
      "returns": {
        "defined": {
          "name": "strategy"
        }
      }
    },
    {
      "name": "getStrategies",
      "discriminator": [
        138,
        127,
        147,
        212,
        159,
        189,
        52,
        250
      ],
      "accounts": [
        {
          "name": "strategyList"
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
            "name": "strategy"
          }
        }
      }
    },
    {
      "name": "updateStrategyStatus",
      "discriminator": [
        75,
        150,
        40,
        235,
        0,
        137,
        169,
        59
      ],
      "accounts": [
        {
          "name": "bot"
        },
        {
          "name": "strategyList",
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
          "name": "tokenAddress",
          "type": "pubkey"
        },
        {
          "name": "isActive",
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
    }
  ],
  "events": [
    {
      "name": "strategyAddedEvent",
      "discriminator": [
        80,
        39,
        53,
        74,
        111,
        1,
        201,
        250
      ]
    },
    {
      "name": "strategyStatusUpdatedEvent",
      "discriminator": [
        34,
        208,
        66,
        66,
        64,
        129,
        46,
        7
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
      "msg": "A moeda especificada não foi encontrada."
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
      "name": "maxSubAccountsReached",
      "msg": "Max Sub Accounts Reached"
    },
    {
      "code": 6012,
      "name": "invalidSubAccountId",
      "msg": "Invalid Sub Account Id"
    },
    {
      "code": 6013,
      "name": "strategyNotLinked",
      "msg": "Strategy Not Linked"
    },
    {
      "code": 6014,
      "name": "strategyBalanceNotFound",
      "msg": "Strategy Balance Not Found"
    },
    {
      "code": 6015,
      "name": "coinNotLinked",
      "msg": "Coin Not Linked"
    }
  ],
  "types": [
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
      "name": "strategyAddedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
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
            "name": "uri",
            "type": "string"
          },
          {
            "name": "tokenAddress",
            "type": "pubkey"
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
      "name": "strategyStatusUpdatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
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
    }
  ]
};
