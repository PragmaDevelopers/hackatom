# 🧠 WebDex - Projeto Modular em Solana com Anchor

Este projeto é estruturado em **Anchor** sobre a **blockchain Solana**, com foco em **modularidade, extensibilidade** e organização por domínios. Ele simula uma plataforma descentralizada de estratégias com bots, pagamentos e subcontas.

## 🧰 Tecnologias necessárias

Antes de compilar ou rodar os programas, você precisa ter os seguintes componentes instalados no seu sistema:

| Tecnologia        | Versão recomendada            | Instalação                                                                 |
|-------------------|-------------------------------|----------------------------------------------------------------------------|
| **Rust (nightly)**| `rustup default nightly`      | [Instalar Rust](https://www.rust-lang.org/tools/install)                  |
| **Solana CLI**    | `>=1.18.4`                    | `sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"`        |
| **Anchor CLI**    | `v0.31.0`                     | `cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.0 anchor-cli` |
| **Node.js**       | `>=18`                        | [Instalar Node.js](https://nodejs.org)                                    |
| **Yarn**          | `>=1.22`                      | `npm install -g yarn`                                                     |
| **ts-mocha**      | `latest`                      | `yarn add ts-mocha --dev` (ou via `package.json`)                         |

### 🔗 Extras úteis

- **VSCode** com extensões para Solana, Rust e Anchor
- Solana wallet local: `solana-keygen new --outfile ~/.config/solana/id.json`
- Configure devnet como padrão: `solana config set --url https://api.devnet.solana.com`

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

## 🧹 Módulos e Programas

### `webdex_factory`
- Criação de bots
- Registro de endereços de outros módulos (payments, sub_accounts, strategy)
- Controle de autoridade do bot
- Seeds: `["bot", contract_address]`
- Link para a documentação: [Webdex Factory](./programs/webdex_factory/README.md)

### `webdex_manager`
- Criação de users (`CoinData`)
- Adicionar ou Subtrair `gas` e `pass`
- Seeds: `["user", signer]`
- Link para a documentação: [Webdex Manager](./programs/webdex_manager/README.md)

### `webdex_network`
- Gerencia a taxa de pagamento das indicações
- Faz a retirada de saldo, transferindo para `user` e `fee_collector`
- Seeds: `["user", signer]`
- Link para a documentação: [Webdex Network](./programs/webdex_network/README.md)

### `webdex_payments`
- Adição de moedas aceitas (`CoinData`)
- Controle de `FeeTier` por contrato
- Seeds: `["payments", bot_pda]`
- Link para a documentação: [Webdex Payments](./programs/webdex_payments/README.md)

### `webdex_strategy`
- Lista e gerenciamento de estratégias para um bot
- Seeds: `["strategy_list", bot_pda]`
- Link para a documentação: [Webdex Strategy](./programs/webdex_strategy/README.md)

### `webdex_sub_accounts`
- Criação de subcontas por usuário
- Armazenamento de saldos por estratégia/token
- Seeds:
  - `["sub_account_list", bot, user]`
  - `["sub_account", bot, user, name]`
  - `["strategy_balance", bot, sub_account, strategy_token]`
  - Link para a documentação: [Webdex Sub Accounts](./programs/webdex_sub_accounts/README.md)

## 🔄 Integração entre Programas

Os programas se comunicam entre si via:

- **Accounts compartilhadas (PDAs)**
- **Seeds determinísticas**
- **Chaves cruzadas validadas manualmente**

## 🔐 Geração da Wallet Solana (id.json)

Para que o Anchor e o Solana CLI possam assinar transações e deployar programas, é necessário ter uma **carteira Solana local** configurada.

O Anchor utiliza, por padrão, a variável de ambiente `ANCHOR_WALLET`, crie a carteira através do comando:

```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

🔍 Verificar se foi criada com sucesso

```bash
solana address
```

Depois de gerar a carteira, envie SOL de teste com:

```bash
solana airdrop 2 --url https://api.devnet.solana.com
```

## 🌐 Configuração de Ambiente Anchor (Devnet)

Antes de rodar os testes ou interagir com os programas via scripts TypeScript, você precisa configurar duas variáveis de ambiente no seu terminal:

```bash
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
export ANCHOR_WALLET=~/.config/solana/id.json
```

## 🧲 Testes

Os testes são feitos com `ts-mocha`, utilizando `anchor.workspace` para interagir com cada programa de forma isolada.

Rodar testes:

```bash
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**.ts # roda todos os testes
yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/A_add_bot.ts  # roda um arquivo específico
```

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

## 📌 Observações

- Estrutura modular facilita upgrades independentes por domínio
- Separação entre lógica (`processor.rs`) e contexto (`state.rs`) em cada programa
- Impossibilidade de chamar funções que façam o `init` ou `init-if-need` entre os contratos via CPI 

## ✨ Feito com:

- [Solana](https://solana.com)
- [Anchor Framework](https://book.anchor-lang.com)
- [Mocha + ts-mocha](https://mochajs.org/)
- [TypeScript](https://www.typescriptlang.org/)