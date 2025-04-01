# WebdEX Project

Este repositório contém os programas on-chain e o front-end do WebdEX, um sistema descentralizado de gestão e execução de estratégias de trading.

## 📂 Estrutura do Projeto

```
webdex-project/
│── app/                 # Front-end do projeto
│── programs/            # Programas on-chain
│   ├── webdex_manager/   # Gerencia usuários, saldos e chamadas para outros contratos
│   ├── webdex_factory/   # Cria novos contratos e componentes do sistema
│   ├── webdex_payments/  # Lida com transações financeiras, taxas e fluxo de ativos
│   ├── webdex_strategies/ # Gerencia e armazena estratégias de negociação
│   ├── webdex_subaccounts/ # Implementa subcontas para melhor organização dos usuários
│   ├── webdex_network/   # Lida com networks e indicações
│── webdex_common/       # Biblioteca compartilhada entre os programas
│── target/              # Diretório de build gerado pelo Anchor
│── migrations/          # Scripts de migração
│── tests/               # Testes automatizados
│── Anchor.toml          # Configuração do Anchor
│── Cargo.toml           # Dependências do projeto
│── ts/                  # SDK TypeScript para interação com os programas
```

### 📌 `webdex_common`
A pasta `webdex_common` contém módulos reutilizáveis entre os programas, incluindo:
- Estruturas compartilhadas de contas e eventos
- Funções auxiliares para cálculos e validações
- Definições de erros padronizados

## 🚀 Como rodar o projeto

### Pré-requisitos
- Rust e Cargo
- Solana CLI
- Anchor CLI
- Node.js e npm

### Configuração do ambiente

```sh
solana config set --url devnet
solana airdrop 2
```

### Construindo o projeto

```sh
anchor build
```

### Testando os contratos

```sh
anchor test
```

### Fazendo deploy

```sh
anchor deploy
```

## 🖥️ Front-end
O front-end do WebdEX está localizado na pasta `app/`. Ele consome os IDLs gerados na pasta `target/idl/` para interagir com os programas on-chain.

### Rodando o front-end

```sh
cd app
npm install
npm run dev
```

Agora, acesse o WebdEX via `http://localhost:3000` e aproveite! 🚀