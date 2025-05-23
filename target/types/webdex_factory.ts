/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_factory.json`.
 */
export type WebdexFactory = {
  "address": "9i1mJt5ioM5RaffYiQxLdv1dQnotfoDXDzENZnGsoqjX",
  "metadata": {
    "name": "webdexFactory",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addBot",
      "discriminator": [
        33,
        251,
        240,
        162,
        159,
        44,
        51,
        74
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  111,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "managerAddress"
              }
            ]
          }
        },
        {
          "name": "managerAddress",
          "docs": [
            "CHECK"
          ]
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
          "name": "contractAddress",
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
    },
    {
      "name": "getBotInfo",
      "discriminator": [
        217,
        201,
        199,
        39,
        89,
        250,
        26,
        106
      ],
      "accounts": [
        {
          "name": "bot"
        }
      ],
      "args": [
        {
          "name": "contractAddress",
          "type": "pubkey"
        }
      ],
      "returns": {
        "defined": {
          "name": "botInfo"
        }
      }
    },
    {
      "name": "removeBot",
      "discriminator": [
        49,
        239,
        98,
        212,
        120,
        98,
        225,
        252
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updateBot",
      "discriminator": [
        72,
        160,
        124,
        173,
        234,
        179,
        108,
        203
      ],
      "accounts": [
        {
          "name": "bot",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "strategyAddress",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "subAccountAddress",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "paymentsAddress",
          "type": {
            "option": "pubkey"
          }
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
    }
  ],
  "events": [
    {
      "name": "botCreated",
      "discriminator": [
        172,
        143,
        0,
        188,
        140,
        195,
        196,
        202
      ]
    },
    {
      "name": "botRemoved",
      "discriminator": [
        200,
        194,
        224,
        187,
        67,
        115,
        183,
        25
      ]
    },
    {
      "name": "botUpdated",
      "discriminator": [
        125,
        156,
        171,
        248,
        124,
        139,
        132,
        193
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
      "name": "unauthorizedOwner",
      "msg": "Unauthorized Owner"
    },
    {
      "code": 6008,
      "name": "unauthorizedVoidCollector",
      "msg": "Unauthorized Void Collector"
    },
    {
      "code": 6009,
      "name": "unauthorizedFeeCollectorNetwork",
      "msg": "Unauthorized Fee Collector Network"
    },
    {
      "code": 6010,
      "name": "unauthorizedSubAccount",
      "msg": "Você não tem permissão para acessar esta subconta."
    },
    {
      "code": 6011,
      "name": "accountNotLinkedToCurrency",
      "msg": "Account not linked to currency"
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
    },
    {
      "code": 6016,
      "name": "accountNotFound",
      "msg": "Account not found"
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
      "name": "botCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contractAddress",
            "type": "pubkey"
          },
          {
            "name": "bot",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "botInfo",
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
      "name": "botRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bot",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "botUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bot",
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
          }
        ]
      }
    }
  ]
};
