**Documentação Técnica: Migração do Contrato WEbdEXStrategiesV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXStrategiesV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
1. `addStrategy(...)`
2. `updateStrategyStatus(...)`
3. `getStrategies(...)`
4. `findStrategy(...)`

### Armazenamento:
- Mapeamento: `mapping(address => Bot) internal bots;`
- Estrutura `Bot` com campos:
  - `contractAddress`, `strategies`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `Strategy`, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
1. `add_strategy`  → Cria uma estrategia vinculada a um bot, cria metadados NFT usando a metaplex 
2. `update_strategy_status` → Atualiza o status da estrategia
3. `get_strategies` → Faz o get de `StrategyList`
4. `find_strategy` → Faz o get de um `Strategy` em especifico
5. `delete_strategy` → Deleta uma `Strategy` em especifico

### Declaração do Programa:
```rust
#[program]
pub mod webdex_strategy {
    // ...
}
```

### Mudanças de Paradigma:
| Conceito EVM         | Equivalente Solana (Anchor)     |
|----------------------|---------------------------------|
| `mapping`            | `Account` com seeds/PDA         |
| `msg.sender`         | `ctx.accounts.signer.key`       |
| `require(...)`       | `require!(cond, ErrorCode::X)`  |
| `onlyOwner` modifier | Verificação manual via `signer` |

### Exemplo de Contexto AddBot
```rust
#[derive(Accounts)]
pub struct AddStrategy<'info> {
    pub bot: Account<'info, Bot>,

    #[account(
        init_if_needed,
        payer = signer,
        space = StrategyList::INIT_SPACE,
        seeds = [b"strategy_list", bot.key().as_ref()],
        bump
    )]
    pub strategy_list: Account<'info, StrategyList>,

    #[account(init, payer = signer, mint::decimals = 0, mint::authority = token_authority)]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Esta conta é verificada pelo programa Metaplex
    pub token_address: AccountInfo<'info>,

    /// CHECK: Esta conta é verificada pelo programa Metaplex
    pub metadata_program: AccountInfo<'info>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub token_authority: Signer<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}
```

---

## Integração com Metadata (opcional)
A criação de metadados NFT no Anchor utiliza:
- `anchor_spl::metadata`
- `create_metadata_accounts_v3`

A chamada está preparada mas comentada para personalização futura.

---

## Comunicação entre Contratos
Em ambientes multi-programa:
- **Solidity** usa chamadas diretas ao contrato `Factory` para validações.
- **Solana** pode utilizar **CPI (Cross-Program Invocation)**, onde, por exemplo, o programa de estratégia pode chamar `get_bot_info` no programa `Factory` para validar bots (não implementado neste módulo, mas possível).

---

## Conclusão
A adaptação do contrato `WEbdEXStrategiesV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.