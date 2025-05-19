# Documentação dos Contratos - Módulo `manager`

Este módulo é responsável pela gestão dos usuários, saldos de gás e passe (token SPL), interações de liquidez com subcontas e operações de rebalanceamento de posição.

---

## Estruturas de Conta

### `User`

Armazena os dados de um usuário registrado.

```rust
#[account]
pub struct User {
    pub manager: Pubkey,
    pub gas_balance: u64,
    pub pass_balance: u64,
    pub status: bool,
}
```

### `UserDisplay`

Retornado pela chamada de leitura `get_info_user`.

```rust
pub struct UserDisplay {
    pub manager: Pubkey,
    pub gas_balance: u64,
    pub pass_balance: u64,
}
```

---

## Instruções

### `register`

Registra um novo usuário na plataforma, com um `manager` opcional.

### `get_info_user`

Retorna uma estrutura com os dados atuais do usuário (saldos e manager).

### `add_gas`

Adiciona SOL (gás) à conta do usuário e transfere para uma vault PDA.

### `remove_gas`

Remove SOL da vault PDA e envia de volta ao usuário. Atualiza o saldo de gás.

### `pass_add`

Permite o usuário depositar tokens SPL (ex: WEbdEX) para uso como "pass".

### `pass_remove`

Permite o saque dos tokens SPL da vault para o usuário, reduzindo o saldo de `pass_balance`.

### `liquidity_add`

Permite ao usuário adicionar liquidez em uma determinada estratégia.

* Transfere o token base para a vault da subconta.
* Mint LP tokens para o usuário.

### `liquidity_remove`

Remove liquidez:

* Executa uma CPI com a subconta (`_remove_liquidity`).
* Burn dos LP tokens.
* Retorna token base ao usuário via transferência assinada.

### `rebalance_position`

Usado pelo contrato de pagamento para realizar operações de lucro ou prejuízo com LP tokens.

* Verifica se `signer` é o `owner` do `bot`.
* Queima ou gera LP tokens para:

  * Usuário (80%)
  * Owner do bot (15%)
  * 4 coletadores (1.25% cada)
* Deduz valores de `gas` e `pass` do usuário.
* Transfere o SOL de gás para o owner do bot.

---

## Eventos

### `RegisterEvent`

Emitido ao registrar um usuário:

```rust
pub struct RegisterEvent {
    pub user: Pubkey,
    pub manager: Pubkey,
}
```

### `BalanceGasEvent`

```rust
pub struct BalanceGasEvent {
    pub user: Pubkey,
    pub balance: u64,
    pub value: u64,
    pub increase: bool,
    pub is_operation: bool,
}
```

### `BalancePassEvent`

```rust
pub struct BalancePassEvent {
    pub user: Pubkey,
    pub balance: u64,
    pub value: u64,
    pub increase: bool,
    pub is_operation: bool,
}
```

---

## PDAs

* `user`: `seeds = [b"user", signer.key().as_ref()]`
* `vault_sol_account`: `seeds = [b"vault_sol_account", user.key().as_ref()]`
* `lp_token`: `seeds = [b"lp_token", strategy_token, sub_account, token_mint]`
* `lp_mint_authority`: `seeds = [b"mint_authority", strategy_token]`
* `sub_account_authority`: `seeds = [b"sub_account", sub_account.key()]`

---

## Distribuição de LP Tokens (`rebalance_position`)

| Destinatário   | Percentual |
| -------------- | ---------- |
| Usuário        | 80%        |
| Owner do bot   | 15%        |
| Cada collector | 1.25%      |

---

## Requisitos e Validações

* Todos os valores precisam ser `> 0`.
* Valida saldo suficiente para `gas_balance` e `pass_balance`.
* `manager` opcional ao registrar.
* Somente o owner do bot pode chamar `rebalance_position`.

---

## Módulos Externos Utilizados

* `anchor_lang`
* `anchor_spl::token`
* `webdex_sub_accounts::{state, processor}`

---

Para mais detalhes de integração, veja os contratos `payments`, `sub_account` e `strategy_list`.

---

Documentação gerada automaticamente para fins de manutenção e integração com o front-end Web3 (EVM/Solana).