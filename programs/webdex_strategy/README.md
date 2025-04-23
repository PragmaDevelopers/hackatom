# Integração Solana ↔ Solidity – Estratégias

## Visão Geral
Nesta integração, o contrato **WEbdEXStrategiesV4** em Solidity foi adaptado para um equivalente no ambiente Solana com Anchor, responsável pela criação e gerenciamento de estratégias (NFTs) associadas a bots. O gerenciamento das estratégias foi separado do contrato `WEbdEXFactoryV4` para manter responsabilidades separadas.

---

## Solidity – WEbdEXStrategiesV4
O contrato em Solidity:
- Recebe chamadas apenas do contrato `Factory`, garantindo controle de acesso.
- Permite adicionar estratégias com NFTs personalizados (via contrato `NFT`).
- Atualiza o status das estratégias (ativas ou não).
- Permite busca e listagem de estratégias por contrato.

### Principais Estruturas
```solidity
struct Strategy {
    string name;
    address tokenAddress;
    bool isActive;
}
```

---

## Anchor (Solana) – Módulo de Estratégias
A lógica correspondente foi implementada como funções auxiliares (`_add_strategy`, `_update_strategy_status`, etc.) em Rust/Anchor.

### 📌 Função `add_strategy`
Registra uma nova estratégia associada ao bot.

- Valida que o chamador é o dono do bot
- Verifica se o contrato informado é válido
- Cria metadados para o token (estrutura `DataV2`, padrão do Metaplex)
- Adiciona à lista de estratégias (`strategy_list`)
- Emite evento `StrategyAddedEvent`

### 📌 Função `update_strategy_status`
Permite ativar/desativar estratégias.

- Busca a estratégia por `token_address`
- Atualiza o status
- Emite evento `StrategyStatusUpdatedEvent`

### 📌 Função `get_strategies`
Retorna todas as estratégias registradas para um determinado contrato.

### 📌 Função `find_strategy`
Retorna os dados de uma estratégia específica com base em seu `token_address`.

### 📌 Função `delete_strategy`
Remove uma estratégia da lista vinculada ao contrato do bot.

---

## Estrutura Compartilhada: `StrategyList`
No Solana, usamos a conta `StrategyList` com a estrutura:
```rust
pub struct StrategyList {
    pub contract_address: Pubkey,
    pub strategies: Vec<Strategy>,
}
```

- `contract_address`: usado para validar a posse da lista
- `strategies`: vetor contendo todas as estratégias

---

## Integração com Metadata (opcional)
A criação de metadados NFT no Anchor utiliza:
- `anchor_spl::metadata`
- `create_metadata_accounts_v3`

A chamada está preparada mas comentada para personalização futura.

```rust
// create_metadata_accounts_v3(cpi_ctx, metadata_data, true, false, None)?;
```

---

## Controle de Acesso
- Em Solidity, o controle é feito via `onlyOwner()` com base no `Factory`.
- Em Anchor, verificamos se `ctx.accounts.signer` é o dono do `bot`.

---

## Comunicação entre Contratos
Em ambientes multi-programa:
- **Solidity** usa chamadas diretas ao contrato `Factory` para validações.
- **Solana** pode utilizar **CPI (Cross-Program Invocation)**, onde, por exemplo, o programa de estratégia pode chamar `get_bot_info` no programa `Factory` para validar bots (não implementado neste módulo, mas possível).

---

## Conclusão
Este módulo implementa com sucesso a separação de responsabilidades entre `Factory` e `Strategies`, mantendo segurança, escalabilidade e modularidade. Com isso, é possível evoluir cada componente de forma independente e segura em ambas as blockchains.