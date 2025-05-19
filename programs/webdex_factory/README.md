
# 📘 Documentação do Contrato Solana: Gerenciamento de Bots

Este contrato Anchor Solana permite o gerenciamento de bots que representam instâncias de estratégias automatizadas. Ele provê instruções para registro, consulta, atualização e remoção.

---

## 📌 Eventos

### `BotCreated`
Emitido quando um bot é registrado.

```ts
Fields:
- contract_address: Pubkey
- bot: Pubkey
- owner: Pubkey
```

---

### `BotUpdated`
Emitido quando dados de um bot são modificados.

```ts
Fields:
- bot: Pubkey
- strategy_address: Pubkey
- sub_account_address: Pubkey
- payments_address: Pubkey
```

---

### `BotRemoved`
Emitido ao remover um bot.

```ts
Fields:
- bot: Pubkey
- owner: Pubkey
```

---

## 🔧 Instruções

### `add_bot`
Registra um novo bot.

```rust
pub fn _add_bot(ctx: Context<AddBot>, ...) -> Result<()>
```

**Permissão:** Apenas o owner autorizado.

**Checks:**
- `signer` deve ser igual ao `_get_authorized_owner()`
- Não pode sobrescrever bot existente

**Resultado:** Criação e persistência da conta PDA `bot`

---

### `get_bot_info`
Consulta dados de um bot.

```rust
pub fn _get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo>
```

**Valida:** `bot.manager_address == contract_address`

**Retorna:** Struct `BotInfo`

---

### `update_bot`
Atualiza campos de um bot.

```rust
pub fn _update_bot(ctx: Context<UpdateBot>, ...) -> Result<()>
```

**Permissão:** Somente `bot.owner`

**Campos Atualizáveis:**
- `strategy_address`
- `sub_account_address`
- `payments_address`

---

### `remove_bot`
Remove logicamente um bot e fecha sua conta.

```rust
pub fn _remove_bot(ctx: Context<RemoveBot>) -> Result<()>
```

**Permissão:** Somente `bot.owner`

**Valida:** Bot já registrado

**Efeito:** Fecha a conta e emite `BotRemoved`

---

## 📦 Structs

### `Bot`

```rust
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub void_collector_1: Pubkey,
    pub void_collector_2: Pubkey,
    pub void_collector_3: Pubkey,
    pub void_collector_4: Pubkey,
    pub manager_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
    pub fee_withdraw_network: u64,
    pub fee_collector_network_address: Pubkey,
}
```

---

## ⚙️ Contextos de Conta (Anchor)

### `AddBot`
- Cria ou reutiliza PDA do bot via `seeds = [b"bot", manager_address]`
- `signer` é o pagador

### `GetBotInfo`
- Apenas leitura da conta `bot`

### `UpdateBot`
- Requer `mut` e assinatura do `owner`

### `RemoveBot`
- Fecha a conta `bot` e transfere lamports para o `signer`

---

## 🛡 Funções Auxiliares

### `assert_only_owner()`
Valida se `signer == bot.owner`. Retorna erro `Unauthorized` se não.

---

> Criado para integração com sistemas de arbitragem e gestão estratégica via Web3 na Solana.