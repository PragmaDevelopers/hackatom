# 📦 Contrato de SubAccounts WebDex

Este programa Solana (usando Anchor) permite a criação e gerenciamento de subcontas vinculadas a estratégias de liquidez, permitindo operações como adição, retirada, pausa e consulta de saldo de tokens em estratégias descentralizadas (como DEXes ou vaults de investimento).

---

## 🧠 Visão Geral

O contrato gerencia:
- Subcontas personalizadas por usuário.
- Estratégias com múltiplos tokens por subconta.
- Saldos de liquidez por token.
- Operações de pausa e movimentação de liquidez.
- Controle por conta gerenciadora (`bot`).

---

## 🧩 Estrutura de Contas

### 🔸 `SubAccount`

Conta que representa uma subconta individual associada a um usuário.

| Campo            | Tipo        | Descrição                                     |
|------------------|-------------|-----------------------------------------------|
| `id`             | `String`    | Identificador único (PDA).                    |
| `name`           | `String`    | Nome definido pelo usuário.                  |
| `list_strategies`| `Vec<Pubkey>`| Lista de estratégias vinculadas.             |
| `strategies`     | `Vec<Pubkey>`| Contas `StrategyBalanceList` associadas.     |

---

### 🔸 `StrategyBalanceList`

Armazena os saldos por estratégia.

| Campo         | Tipo         | Descrição                            |
|---------------|--------------|----------------------------------------|
| `strategy_token` | `Pubkey`   | Token identificador da estratégia.    |
| `status`      | `bool`       | Ativo/inativo.                        |
| `list_coins`  | `Vec<Pubkey>`| Tokens gerenciados.                   |
| `balance`     | `Vec<BalanceStrategy>` | Saldos por token.           |

---

### 🔸 `BalanceStrategy` (importado de `shared_sub_accounts`)

Representa um token gerenciado em uma estratégia.

| Campo     | Tipo     | Descrição                      |
|-----------|----------|--------------------------------|
| `token`   | `Pubkey` | Token SPL                      |
| `amount`  | `u64`    | Saldo atual                    |
| `name`    | `String` | Nome do token (ex: USDT)       |
| `ico`     | `String` | URL do ícone                   |
| `decimals`| `u8`     | Decimais do token              |
| `status`  | `bool`   | Ativo/inativo                  |
| `paused`  | `bool`   | Pausado para retirada?         |

---

## ⚙️ Instruções

### ✅ `create_sub_account(name)`
Cria uma nova subconta para o usuário.

- Valida se o nome é único por usuário.
- Gera um `id` determinístico via PDA.

---

### 📥 `add_liquidity(...)`
Adiciona liquidez a uma subconta e estratégia:

Parâmetros:
- `strategy_token`, `account_id`, `coin`, `amount`, `name`, `ico`, `decimals`

---

### 📤 `remove_liquidity(...)`
Remove liquidez de um token pausado.

Regras:
- Token deve estar pausado.
- Deve haver saldo suficiente.

---

### 🔄 `position_liquidity(...)`
Opera diretamente no saldo da estratégia (positivo ou negativo).

⚠️ Somente contratos internos com permissão (como WebDex).

---

### 💤 `toggle_pause(...)`
Alterna o estado `paused` de um token de estratégia.

---

### 🔍 `get_sub_accounts(user)`
Lista todas as subcontas do usuário.

---

### 🔍 `find_sub_account_index_by_id(account_id)`
Retorna o índice da subconta no array.

---

### 🔍 `get_balance(...)`
Retorna o saldo de um token em uma estratégia de subconta.

---

### 🔍 `get_balances(...)`
Retorna todos os tokens e saldos de uma estratégia.

---

### 🔍 `get_sub_account_strategies(account_id)`
Retorna as estratégias associadas a uma subconta.

---

## 🚧 Erros Comuns

| Código                        | Descrição                                       |
|------------------------------|-------------------------------------------------|
| `Unauthorized`               | Gerente não autorizado.                         |
| `DuplicateSubAccountName`   | Nome da subconta já existe para o usuário.      |
| `InvalidSubAccountId`       | Subconta não encontrada.                        |
| `StrategyNotLinked`         | Estratégia não está vinculada.                  |
| `CoinNotLinked`             | Token não adicionado anteriormente.             |
| `CoinNotFound`              | Token não encontrado.                           |
| `CoinNotLinkedToStrategy`   | Token desativado.                               |
| `PauseStateUnchanged`       | Já está no estado solicitado.                   |
| `MustPauseBeforeWithdraw`   | É necessário pausar antes de remover liquidez.  |
| `InsufficientFunds`         | Saldo insuficiente.                             |
| `YouMustTheWebDexPayments`  | Apenas o contrato de controle pode operar.      |

---

## 📡 Eventos

- `CreateSubAccountEvent`
- `BalanceLiquidityEvent`
- `ChangePausedEvent`

---

## 🔐 Segurança

- Contas críticas como `bot` e `owner` são verificadas.
- Operações sensíveis exigem que o token esteja pausado.
- Todas as contas PDA são derivadas com seeds controlados.

---

## 🧪 Sugestões de Testes

1. Criar subconta com nome duplicado.
2. Adicionar e remover liquidez com tokens inexistentes.
3. Operar liquidez com diferentes contratos usando CPI.
4. Pausar e despausar tokens.
5. Verificar saldos e estratégias.
