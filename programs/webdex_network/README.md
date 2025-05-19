# Documentação: Contrato WebdEX Network (Anchor Solana)

Este módulo do protocolo WebdEX gerencia as taxas de rede pagas por subcontas a contratos e permite o saque de valores acumulados com dedução de taxa.

---

## ✨ Visão Geral

O contrato é composto por:

* Armazenamento do saldo de taxas pagas (`BalanceInfo`)
* Função de pagamento de taxa para um contrato
* Função de saque com taxa de retirada
* Eventos emitidos para atualizações

---

## 🔢 Estruturas

### BalanceInfo

Armazena o saldo de taxas pagas por um usuário para um contrato específico.

```rust
#[account]
pub struct BalanceInfo {
    pub balance: u64,                  // Saldo atual de taxas
    pub token: Pubkey,                // Token SPL utilizado (ex: USDT)
    pub user: Pubkey,                 // Usuário pagante
    pub contract_address: Pubkey,     // Endereço do contrato alvo
}
```

### BalanceData (Retorno de consulta)

```rust
pub struct BalanceData {
    pub balance: u64,
}
```

---

## ⚖️ Instruções

### 1. `_pay_fee`

Registra o pagamento de uma taxa por um usuário para um contrato. Não transfere tokens; apenas atualiza o estado.

**Parâmetros:**

* `sub_account_name`: Nome da subconta (pode ser usado para rastreamento)
* `contract_address`: Endereço do contrato a ser vinculado ao pagamento
* `amount`: Quantidade de tokens pagos como taxa

**Restrição:**

* O `signer` deve ser o `owner` do `bot`

**Evento Emitido:**

* `BalanceNetworkAdd`

### 2. `_withdrawal`

Permite que o `fee_collector_network_address` saque o saldo, aplicando uma taxa de retirada definida no `bot`.

**Parâmetros:**

* `amount`: Valor total a ser sacado (100%)
* Taxa aplicada: `bot.fee_withdraw_network` (%)
* Destino: `signer` (usuário) recebe valor líquido, `fee_collector_network_account` recebe a taxa

**Evento Emitido:**

* `BalanceNetworkRemove`

### 3. `_get_balance`

Consulta o saldo registrado para um contrato, token e usuário.

**Retorno:**

* `BalanceData { balance }`

---

## 🎙️ Eventos

### `BalanceNetworkAdd`

Emitido ao pagar uma taxa:

```rust
pub struct BalanceNetworkAdd {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub token: Pubkey,
    pub new_balance: u64,
    pub amount: u64,
}
```

### `BalanceNetworkRemove`

Emitido ao sacar:

```rust
pub struct BalanceNetworkRemove {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub token: Pubkey,
    pub new_balance: u64,
    pub amount: u64,
    pub fee: u64,
}
```

---

## 🧱 PDAs e Seeds

| Conta                           | Seeds                                                  |
| ------------------------------- | ------------------------------------------------------ |
| `balance_info`                  | `[b"balance_info", contract_address, user, usdt_mint]` |
| `user_network_account`          | Associated Token do usuário para o token               |
| `vault_network_account`         | Associated Token da fee authority (vault)              |
| `fee_collector_network_account` | Associated Token da fee authority                      |

---

## ⚡ Possíveis Melhoria

* Validar que o `vault_network_account` é controlado por um PDA do programa
* Criar instrução de "burn" ou limpeza de saldo se contrato for encerrado
* Adicionar campo `last_updated` em `BalanceInfo` para rastrear atividade

---

## 📃 Exemplo de Uso (Frontend)

1. Pagar taxa:

```ts
await program.methods.payFee("sub0", contract, amount)
  .accounts({ user, bot, ... })
```

2. Sacar:

```ts
await program.methods.withdraw(amount)
  .accounts({ user, feeCollector, ... })
```

3. Consultar saldo:

```ts
await program.account.balanceInfo.fetch(pda)
```

---

> Documentação gerada para uso interno da equipe WebdEX. Contribuições são bem-vindas! 🚀