/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/webdex_payments.json`.
 */
export type WebdexPayments = {
  "address": "Gp1yoP72LTgD3pQrnkKw9BTCTbEDC2aDWBVkjDadaV3f",
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
    }
  ]
};
