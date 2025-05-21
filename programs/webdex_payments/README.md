# Contrato de Pagamentos WebDex

O contrato de **Pagamentos** é um componente central do ecossistema **WebDex**, responsável pela gestão de taxas, controle de moedas e abertura de posições com cálculo automatizado de taxas.

## ✨ Funcionalidades

- **Gestão de Faixas de Taxas**: Configure múltiplas faixas de taxas baseadas no valor da transação.  
- **Gestão de Moedas**: Habilite ou desabilite moedas para negociação.  
- **Abertura de Posições**: Gerencie a criação de posições com cálculo automático de taxas.  
- **Armazenamento Temporário de Taxas**: Armazena taxas calculadas em PDAs para processamento posterior.

## 📦 Estrutura do Contrato

### 🧾 Contas Principais

#### `Payments`
```rust
pub struct Payments {
    pub contract_address: Pubkey,     // Endereço do contrato gerenciador
    pub fee_tiers: Vec<FeeTier>,      // Faixas de taxa configuradas
    pub coins: Vec<CoinData>,         // Moedas suportadas
}
```

#### `FeeAccount` (Armazenamento Temporário)
```rust
pub struct FeeAccount {
    pub fee: u64, // Valor da taxa calculada
}
```

### 🏗️ Estruturas de Dados

#### `FeeTier`
```rust
pub struct FeeTier {
    pub limit: u64, // Limite superior da faixa
    pub fee: u64,   // Valor da taxa (absoluto)
}
```

#### `CoinData`
```rust
pub struct CoinData {
    pub pubkey: Pubkey, // Endereço da mint da moeda
    pub coin: Coins,    // Metadados da moeda
}
```

#### `Coins`
```rust
pub struct Coins {
    pub name: String,   // Nome da moeda
    pub symbol: String, // Símbolo da moeda
    pub decimals: u8,   // Casas decimais da moeda
    pub status: bool,   // Se a moeda está habilitada
}
```

## 📥 Instruções

### 1. Adicionar/Atualizar Faixas de Taxas  
**Instrução:** `_add_fee_tiers`

**Descrição:** Adiciona ou substitui todas as faixas de taxas do contrato.

**Parâmetros:**
- `contract_address`: Endereço do contrato gerenciador
- `new_fee_tiers`: Vetor com novas faixas de taxas

**Requisitos:**
- Somente o dono do bot pode chamar
- Bot deve estar registrado

### 2. Obter Faixas de Taxas  
**Instrução:** `_get_fee_tiers`

**Descrição:** Retorna todas as faixas de taxas configuradas.

**Parâmetros:** Nenhum

### 3. Gerenciar Moedas  
**Instrução:** `_revoke_or_allow_currency`

**Descrição:** Habilita/desabilita uma moeda ou adiciona uma nova.

**Parâmetros:**
- `coin_pubkey`: Endereço da mint da moeda
- `status`: `true` para habilitar, `false` para desabilitar
- `name`: Nome da moeda (para novas moedas)
- `symbol`: Símbolo da moeda (para novas moedas)
- `decimals`: Casas decimais da moeda (para novas moedas)

**Requisitos:**
- Somente o dono do bot pode chamar
- O status deve ser diferente do atual

### 4. Remover Moeda  
**Instrução:** `_remove_coin`

**Descrição:** Remove completamente uma moeda da lista.

**Parâmetros:**
- `coin`: Endereço da mint da moeda a ser removida

**Requisitos:**
- Somente o dono do bot pode chamar
- A moeda deve existir

### 5. Abrir Posição  
**Instrução:** `_open_position`

**Descrição:** Abre uma nova posição de negociação com cálculo de taxa.

**Parâmetros:**
- `account_id`: Identificador da subconta
- `strategy_token`: Endereço do token da estratégia
- `amount`: Valor da posição
- `coin`: Moeda base
- `gas`: Custo estimado de gás
- `currrencys`: Pares de moedas envolvidos

**Requisitos:**
- Somente o dono do bot pode chamar
- Estratégia válida
- Todas as moedas devem estar habilitadas
- Saldo suficiente

**Efeitos:**
- Cria conta temporária de taxa
- Emite eventos de posição
- Calcula e armazena taxa

## 💰 Cálculo de Taxas

Lógica:

1. Para um determinado valor da transação, percorre as faixas de taxas na ordem.
2. Usa a primeira faixa onde `valor <= limite`.
3. Se nenhuma faixa corresponder, usa a taxa da última faixa.
4. Se não houver faixas, a taxa é 0.

## 📡 Eventos

### `OpenPositionEvent`
Emitido quando uma nova posição é aberta:
```rust
pub struct OpenPositionEvent {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub details: PositionDetails,
}
```

### `TraderEvent`
Emitido para cada par de moedas na negociação:
```rust
pub struct TraderEvent {
    pub contract_address: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}
```

## ⚠️ Códigos de Erro

| Código                   | Descrição                                 |
|--------------------------|-------------------------------------------|
| `Unauthorized`           | Assinante não é o dono do bot             |
| `BotNotFound`            | Bot não registrado com o contrato         |
| `InvalidContractAddress` | Endereço do contrato inválido             |
| `StatusMustBeDifferent`  | Status da moeda não mudou                 |
| `StrategyNotFound`       | Estratégia inválida ou inativa            |
| `InvalidCoin`            | Moeda desabilitada ou não suportada       |
| `CoinNotFound`           | Moeda não encontrada na lista             |

## 🧪 Exemplos de Uso

### Inicializar Conta de Pagamentos
```rust
let ctx = Context<RevokeOrAllowCurrency>;
_revoke_or_allow_currency(
    ctx,
    coin_pubkey,
    true,
    "Solana".to_string(),
    "SOL".to_string(),
    9
)?;
```

### Definir Faixas de Taxas
```rust
let tiers = vec![
    FeeTier { limit: 1000, fee: 10 },
    FeeTier { limit: 10000, fee: 50 },
];
_add_fee_tiers(ctx, contract_address, tiers)?;
```

### Abrir Posição
```rust
let currencies = vec![
    Currencys { from: usdc_mint, to: sol_mint }
];
_open_position(
    ctx,
    9,
    "account-123".to_string(),
    strategy_token,
    500,
    usdc_mint,
    0.001,
    currencies
)?;
```

## 🔒 Segurança

- Todas as operações críticas exigem autorização do dono do bot.  
- Verificação do endereço do contrato evita uso indevido.  
- Contas temporárias de taxa são baseadas em PDA e únicas por posição.  
- Verificação do status das moedas impede negociações não autorizadas.