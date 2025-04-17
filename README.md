# 🧠 WebDex - Projeto Modular em Solana com Anchor

Este projeto é estruturado em **Anchor** sobre a **blockchain Solana**, com foco em **modularidade, extensibilidade** e organização por domínios. Ele simula uma plataforma descentralizada de estratégias com bots, pagamentos e subcontas.

---

## 📁 Estrutura do Projeto

```bash
.
├── Anchor.toml
├── Cargo.toml
├── programs/
│   ├── webdex_factory/         # Lida com criação e gerenciamento de bots
│   ├── webdex_payments/        # Controle de moedas aceitas e fee tiers
│   ├── webdex_strategy/        # Estratégias vinculadas aos bots
│   └── webdex_sub_accounts/    # Subcontas, saldos e estratégias do usuário
├── shared/
│   ├── factory/                # Structs e tipos compartilhados do factory
│   ├── payments/               # Structs e tipos compartilhados do payments
│   ├── strategy/               # Structs e tipos compartilhados do strategy
│   └── sub_accounts/           # Structs e tipos compartilhados do sub_accounts
├── tests/                      # Testes em TypeScript (Mocha + Anchor)
│   ├── 01_webdex_factory.ts
│   ├── 02_webdex_payments.ts
│   ├── 03_webdex_strategy.ts
│   ├── 04_webdex_sub_accounts.ts
│   ├── 05_webdex_close.ts
│   └── setup.ts
└── target/
    └── idl/                    # IDLs geradas automaticamente pelo Anchor
```

---

## 🧹 Módulos e Programas

### `webdex_factory`
- Criação de bots
- Registro de endereços de outros módulos (payments, sub_accounts, strategy)
- Controle de autoridade do bot
- Seeds: `["bot", contract_address]`

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
- `seeds::program = ...` para validar PDAs criadas por outros programas

---

## 🧲 Testes

Os testes são feitos com `ts-mocha`, utilizando `anchor.workspace` para interagir com cada programa de forma isolada.

Rodar testes:

```bash
anchor test                   # roda todos os testes
anchor run test -- tests/x.ts  # roda um arquivo específico
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
anchor.workspace.WebdexPayments
anchor.workspace.WebdexStrategy
anchor.workspace.WebdexSubAccounts
```

---

## 📌 Observações

- Estrutura modular facilita upgrades independentes por domínio
- Separação entre lógica (`processor.rs`) e contexto (`state.rs`) em cada programa
- Utiliza derivação de PDA segura com `seeds::program = FACTORY_ID` quando necessário

---

## ✨ Feito com:

- [Solana](https://solana.com)
- [Anchor Framework](https://book.anchor-lang.com)
- [Mocha + ts-mocha](https://mochajs.org/)
- [TypeScript](https://www.typescriptlang.org/)