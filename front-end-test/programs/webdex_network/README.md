**Documentação Técnica: Migração do Contrato WEbdEXNetworkV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXNetworkV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
1. `payFee(...)`
2. `withdrawal(address)`
3. `getBalance(...)`

### Armazenamento:
- Mapeamento: `mapping(address => Bot) internal bots;`
- Estrutura `Bot` com campos:
  - `mapping(address => mapping(address => BalanceInfo)) balances;`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `BalanceInfo`, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
1. `pay_fee`  → Paga a taxa de network
2. `withdrawal` → Subtrai o valor adquido das taxas de network 
3. `get_balance` → Pega o valor da sua liquidez atual das taxas de network

### Declaração do Programa:
```rust
#[program]
pub mod webdex_network {
    // ...
}
```

### Mudanças de Paradigma:
| Conceito EVM              | Equivalente Solana (Anchor)    |
|---------------------------|--------------------------------|
| `mapping`                 | `Account` com seeds/PDA        |
| `msg.sender`              | `ctx.accounts.signer.key`      |
| `require(...)`            | `require!(cond, ErrorCode::X)` |
| `onlySubAccount` modifier | Não foi necessário             |

### Exemplo de Contexto AddBot
```rust
#[derive(Accounts)]
pub struct PayFee<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + std::mem::size_of::<BalanceInfo>(),
        seeds = [b"balance_info", contract_address.key().as_ref(), user.key().as_ref(), usdt_mint.key().as_ref()],
        bump
    )]
    pub balance_info: Account<'info, BalanceInfo>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: Account<'info, Mint>,

    /// CHECK: Apenas para seeds
    pub contract_address: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Conclusão
A adaptação do contrato `WEbdEXNetworkV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.