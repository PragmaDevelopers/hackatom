**Documentação Técnica: Migração do Contrato WEbdEXSubAccountsV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXSubAccountsV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
1. `create(...)`
2. `getBalance(...)`
3. `getBalances(...)`
4. `getStrategies(...)`
5. `getSubAccounts(...)`
6. `addLiquidy(...)`
7. `position(...)`
8. `findSubAccountIndexById(...)`

### Armazenamento:
- Mapeamento: `mapping(address => Bot) internal bots;`
- Estrutura `Bot` com campos:
  - `contractAddress`, `subAccounts`
- Mapeamento: `mapping(string => bool) private usedCodes;`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `SubAccount`, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
1. `create_sub_account`  → Cria uma `SubAccount`
2. `get_sub_accounts` → Get de todas as `SubAccount` do `User`
3. `find_sub_account_index_by_id` → Retorna o indice/index da `SubAccount`
4. `add_liquidity` → Adiciona os valores de liquidez a `SubAccount`
5. `get_balance` → Retorna o saldo da `SubAccount` com a `Strategy` e `Coins` especifica
6. `get_balances` → Retorna os saldos da `SubAccount` com a `Strategy`
7. `get_sub_account_strategies` → Retorna as `Strategy` de uma `SubAccount`
8. `_remove_liquidity` → Subtrai os valores de liquidez a `SubAccount`. Chamada em `webdex_manager/liquidity_remove()` via CPI
9. `_position_liquidity` → Atualiza o saldo da `Strategy` e rertorna o antigo. Chamada em `webdex_payments/open_position()` via CPI

### Declaração do Programa:
```rust
#[program]
pub mod webdex_sub_accounts {
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
| `onlyManager` modifier  | Verificação manual via `signer` |

### Exemplo de Contexto AddBot
```rust
#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = SubAccountList::SPACE,
        seeds = [b"sub_account_list", user.key().as_ref()],
        bump
    )]
    pub sub_account_list: Account<'info, SubAccountList>,

    #[account(
        init,
        payer = signer,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Conclusão
A adaptação do contrato `WEbdEXSubAccountsV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.