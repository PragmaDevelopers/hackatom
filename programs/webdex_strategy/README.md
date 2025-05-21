# 📘 Contrato de Estratégias WebDex

Este contrato gerencia a criação, atualização, listagem e exclusão de estratégias de trading no ecossistema WebDex, garantindo controle de acesso e integridade dos dados.

---

## 🔧 Funcionalidades

- **Criação de Estratégias**: Gera um novo token com metadados via Metaplex e registra a estratégia.
- **Atualização de Status**: Ativa ou desativa estratégias existentes.
- **Listagem de Estratégias**: Retorna todas as estratégias registradas.
- **Busca de Estratégia**: Recupera uma estratégia específica pelo endereço do token.
- **Exclusão de Estratégia**: Remove uma estratégia da lista.

---

## 🧱 Estrutura de Dados

### `Strategy`

```rust
pub struct Strategy {
    pub name: String,
    pub token_address: Pubkey,
    pub is_active: bool,
}
```

### `StrategyList`

```rust
#[account]
pub struct StrategyList {
    pub contract_address: Pubkey,
    pub strategies: Vec<Strategy>,
}
```

---

## 📥 Instruções

### 1. `_add_strategy`

**Descrição**: Cria uma nova estratégia com um token associado e metadados.

**Parâmetros**:

- `name`: Nome da estratégia.
- `symbol`: Símbolo do token.
- `uri`: URI dos metadados.
- `contract_address`: Endereço do contrato gerenciador.

**Requisitos**:

- Somente o proprietário do bot pode chamar.
- O bot deve estar registrado com o contrato.
- Limite de estratégias não excedido.

**Efeitos**:

- Cria metadados via Metaplex.
- Adiciona a estratégia à lista.
- Emite evento `StrategyAddedEvent`.

### 2. `_update_strategy_status`

**Descrição**: Ativa ou desativa uma estratégia existente.

**Parâmetros**:

- `contract_address`: Endereço do contrato gerenciador.
- `token_address`: Endereço do token da estratégia.
- `is_active`: Novo status da estratégia.

**Requisitos**:

- Somente o proprietário do bot pode chamar.
- O bot deve estar registrado com o contrato.

**Efeitos**:

- Atualiza o status da estratégia.
- Emite evento `StrategyStatusUpdatedEvent`.

### 3. `_get_strategies`

**Descrição**: Retorna todas as estratégias registradas.

**Parâmetros**:

- `contract_address`: Endereço do contrato gerenciador.

**Requisitos**:

- O endereço do contrato deve corresponder ao registrado.

**Retorno**:

- `Vec<Strategy>`: Lista de estratégias.

### 4. `_find_strategy`

**Descrição**: Busca uma estratégia específica pelo endereço do token.

**Parâmetros**:

- `contract_address`: Endereço do contrato gerenciador.
- `token_address`: Endereço do token da estratégia.

**Requisitos**:

- O endereço do contrato deve corresponder ao registrado.

**Retorno**:

- `Strategy`: Estratégia encontrada.

### 5. `_delete_strategy`

**Descrição**: Remove uma estratégia da lista.

**Parâmetros**:

- `contract_address`: Endereço do contrato gerenciador.
- `token_address`: Endereço do token da estratégia.

**Requisitos**:

- Somente o proprietário do bot pode chamar.
- O bot deve estar registrado com o contrato.

**Efeitos**:

- Remove a estratégia da lista.
- Emite evento `StrategyStatusUpdatedEvent` com `is_active: false`.

---

## 📢 Eventos

### `StrategyAddedEvent`

```rust
pub struct StrategyAddedEvent {
    pub contract_address: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub token_address: Pubkey,
}
```

### `StrategyStatusUpdatedEvent`

```rust
pub struct StrategyStatusUpdatedEvent {
    pub contract_address: Pubkey,
    pub token_address: Pubkey,
    pub is_active: bool,
}
```

---

## 🔐 Segurança

- Todas as operações críticas exigem autorização do proprietário do bot.
- Verificação do endereço do contrato para evitar uso indevido.
- Limite máximo de estratégias para evitar sobrecarga.

---

## 🧪 Exemplo de Uso

### Criar Estratégia

```rust
_add_strategy(
    ctx,
    "Minha Estratégia".to_string(),
    "MST".to_string(),
    "https://meusite.com/metadata.json".to_string(),
    contract_address,
)?;
```

### Atualizar Status

```rust
_update_strategy_status(
    ctx,
    contract_address,
    token_address,
    false,
)?;
```

### Listar Estratégias

```rust
let estrategias = _get_strategies(ctx, contract_address)?;
```

### Buscar Estratégia

```rust
let estrategia = _find_strategy(ctx, contract_address, token_address)?;
```

### Excluir Estratégia

```rust
_delete_strategy(ctx, contract_address, token_address)?;
```