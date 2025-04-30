**Documentação Técnica: Migração do Contrato WEbdEXManagerV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXManagerV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
01. `register(...)`
02. `createSubAccount(...)`
03. `getInfoUser(...)`
04. `liquidyAdd(...)`
05. `liquidyRemove(...)`
06. `togglePause(...)`
07. `gasRemove(...)`
09. `gasAdd(...)`
10. `gasBalance(...)`
11. `passAdd(...)`
12. `passRemove(...)`
13. `passBalance(...)`
14. `rebalancePosition(...)`

### Armazenamento:
- Mapeamento: `mapping(address => User) internal users;`
- Estrutura `User` com campos:
  - `manager`, `gasBalance`, `passBalance`, `status`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `User` dentre outros, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
01. `register_manager`  → Cria uma conta para ser manager
02. `register` → Cria a conta user com auxilio de manager
03. `get_info_user` → Faz o get dos dados de `User`
04. `add_gas` → Adiciona gas a conta `User`
05. `remove_gas` → Subtrai gas da conta `User`
06. `pass_add` → Adiciona pass a conta `User`
07. `pass_remove` → Subtrai pass da conta `User`
08. `liquidity_add` → Adiciona liquidez ao `User -> Vault` e mint os tokens
09. `liquidity_remove` → Devolve liquidez ao `Vault -> User` e burn os tokens
10. `rebalance_position` → Atualiza (gas e pass). Mint e burn dependendo do amout

> Funções como `createSubAccount` e `liquidyAdd` foram movidas para contratos separados especializados, e podem ser acessadas via CPI (Cross-Program Invocation) quando necessário. Isso foi feito devido a dificuldade de se trabalhar com laços de repetição envolvendo funções externas aos contratos, o mesmo é válido quando se trata de funções responsáveis por inicializar uma conta.

### Declaração do Programa:
```rust
#[program]
pub mod webdex_manager {
    // ...
}
```

### Mudanças de Paradigma:
| Conceito EVM            | Equivalente Solana (Anchor)     |
|-------------------------|---------------------------------|
| `mapping`               | `Account` com seeds/PDA         |
| `msg.sender`            | `ctx.accounts.signer.key`       |
| `require(...)`          | `require!(cond, ErrorCode::X)`  |
| `onlyPayments` modifier | Verificação manual via `signer` |

### Exemplo de Contexto AddBot
```rust
#[derive(Accounts)]
pub struct AddGas<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::RegisteredUser
    )]
    pub user: Account<'info, User>,

    /// CHECK: Apenas para seeds
    pub pol_mint: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = pol_mint,
        associated_token::authority = signer,
    )]
    pub user_pol_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = pol_mint,
        associated_token::authority = signer
    )]
    pub vault_pol_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
```

---

## Considerações de Segurança
- Uso de TokenAccount para armazenamento de tokens que não sejam SOL
- Uso de ferramentas de validação automática como `constraint = user.status @ ErrorCode::UnregisteredUser`

---

## Integração entre Contratos via CPI
As funcionalidades auxiliares removidas deste contrato podem ser acessadas por meio de chamadas CPI, mas usar laços de repetição para fazer muitas CPIs pode prejudicar o desempenho na Solana. Exemplo:
```rust
for item in items.iter() {
    let cpi_ctx = ...;
    external_program::cpi::some_instruction(cpi_ctx, item)?;
}
```

---

## Pendências / Futuras Extensões
- Definição formal das interfaces CPI para contratos externos

---

## Conclusão
A adaptação do contrato `WEbdEXManagerV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.