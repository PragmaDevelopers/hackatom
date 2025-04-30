# 🧠 WebDex - Projeto Modular em Solana com Anchor

Este projeto é estruturado em **Anchor** sobre a **blockchain Solana**, com foco em **modularidade, extensibilidade** e organização por domínios. Ele simula uma plataforma descentralizada de estratégias com bots, pagamentos e subcontas.

---

## 📁 Estrutura do Projeto

```bash
.
├── Anchor.toml
├── Cargo.toml
├── app/ # Front-end do projeto
├── programs/
│   ├── webdex_factory/ # Lida com criação e gerenciamento de bots
│   ├── webdex_manager/ # Gerencia usuários, saldos e chamadas para outros contratos
│   ├── webdex_network/ # Lida com networks e indicações
│   ├── webdex_payments/ # Controle de moedas aceitas e fee tiers
│   ├── webdex_strategy/ # Estratégias vinculadas aos bots
│   └── webdex_sub_accounts/ # Subcontas, saldos e estratégias do usuário
├── shared/
│   ├── factory/ # Structs e tipos compartilhados do factory
│   ├── manager/ # Structs e tipos compartilhados do manager
│   ├── payments/ # Structs e tipos compartilhados do payments
│   └── sub_accounts/ # Structs e tipos compartilhados do sub_accounts
├── tests/ # Testes em TypeScript (Mocha + Anchor)
│   ├── A_add_bot # Adiciona Bot e Get Bot 
│   ├── B_strategy.ts # Adicionar Strategy, Get Strategies, Update Strategy Status e Find Strategy
│   ├── C_currency_allow.ts # Currency Allow (USDT,WEBDEX,POL)
│   ├── ...
│   └── setup.ts # Gerencia as variáveis globais
└── target/
    └── idl/ # IDLs geradas automaticamente pelo Anchor
```

---

## 🧹 Módulos e Programas

### `webdex_factory`
- Criação de bots
- Registro de endereços de outros módulos (payments, sub_accounts, strategy)
- Controle de autoridade do bot
- Seeds: `["bot", contract_address]`

### `webdex_manager`
- Criação de users (`CoinData`)
- Adicionar ou Subtrair `gas` e `pass`
- Seeds: `["user", signer]`

### `webdex_network`
- Gerencia a taxa de pagamento das indicações
- Faz a retirada de saldo, transferindo para `user` e `fee_collector`
- Seeds: `["user", signer]`

### `webdex_payments`
- Adição de moedas aceitas (`CoinData`)
- Controle de `FeeTier` por contrato
- Seeds: `["payments", bot_pda]`

### `webdex_strategy`
- Lista e gerenciamento de estratégias para um bot
- Seeds: `["strategy_list", bot_pda]`

### `webdex_sub_accounts`
- Criação de subcontas por usuário
- Armazenamento de saldos por estratégia/token
- Seeds:
  - `["sub_account_list", bot, user]`
  - `["sub_account", bot, user, name]`
  - `["strategy_balance", bot, sub_account, strategy_token]`

---

## 🔄 Integração entre Programas

Os programas se comunicam entre si via:

- **Accounts compartilhadas (PDAs)**
- **Seeds determinísticas**
- **Chaves cruzadas validadas manualmente**

---

## 🧲 Testes

Os testes são feitos com `ts-mocha`, utilizando `anchor.workspace` para interagir com cada programa de forma isolada.

Rodar testes:

```bash
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**.ts # roda todos os testes
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/A_add_bot.ts  # roda um arquivo específico
```

---

## 🔧 Como Rodar

1. Instale dependências:

```bash
yarn
```

2. Compile os programas:

```bash
anchor build
```

3. Deploy para devnet:

```bash
anchor deploy
```

4. Teste:

```bash
anchor run test
```

---

## 🗂️ IDLs

As IDLs geradas são exportadas automaticamente para `target/idl`, uma por programa, e consumidas no front-end via:

```ts
anchor.workspace.WebdexFactory
anchor.workspace.WebdexManager
anchor.workspace.WebdexNetwork
anchor.workspace.WebdexPayments
anchor.workspace.WebdexStrategy
anchor.workspace.WebdexSubAccounts
```

---

## 📌 Observações

- Estrutura modular facilita upgrades independentes por domínio
- Separação entre lógica (`processor.rs`) e contexto (`state.rs`) em cada programa
- Impossibilidade de chamar funções que façam o `init` ou `init-if-need` entre os contratos via CPI 

---

## ✨ Feito com:

- [Solana](https://solana.com)
- [Anchor Framework](https://book.anchor-lang.com)
- [Mocha + ts-mocha](https://mochajs.org/)
- [TypeScript](https://www.typescriptlang.org/)