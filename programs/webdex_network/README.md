**Documentação Técnica: Migração do Contrato WEbdEXFactoryV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXFactoryV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
1. `addBot(...)`
2. `getBotInfo(address)`
3. `updateBot(...)`
4. `removeBot(address)`
5. `currencyAllow(address,address)`
6. `currencyRevoke(address,address)`
7. `addStrategy(...)`
8. `updateStrategyStatus(...)`

### Armazenamento:
- Mapeamento: `mapping(address => IFactory.Bot) bots;`
- Estrutura `Bot` com campos:
  - `prefix`, `name`, `owner`, `contractAddress`, `strategyAddress`, `subAccountAddress`, `paymentsAddress`, `tokenPassAddress`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `Bot`, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
1. `add_bot`  → Cria uma conta de bot e popula os dados
2. `get_bot_info` → Retorna estrutura `BotInfo` de leitura
3. `update_bot` → Atualiza ponteiros de `strategy`, `sub_account`, `payments`
4. `remove_bot` → Apaga a conta do bot

> Funções como `currencyAllow`, `currencyRevoke`, `addStrategy` e `updateStrategyStatus` foram movidas para contratos separados especializados, e podem ser acessadas via CPI (Cross-Program Invocation) quando necessário.

### Declaração do Programa:
```rust
#[program]
pub mod webdex_factory {
    // ...
}
```

### Mudanças de Paradigma:
| Conceito EVM         | Equivalente Solana (Anchor)                 |
|----------------------|---------------------------------------------|
| `mapping`            | `Account` com seeds/PDA                     |
| `msg.sender`         | `ctx.accounts.signer.key`               |
| `require(...)`       | `require!(cond, ErrorCode::X)`             |
| `onlyOwner` modifier | Verificação manual via `signer`         |

### Exemplo de Contexto AddBot
```rust
#[derive(Accounts)]
pub struct AddBot<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = Bot::INIT_SPACE,
        seeds = [b"bot", manager_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,

    /// CHECK
    pub manager_address: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Considerações de Segurança
- Todas as chamadas são restritas ao `authority` (equivalente ao `onlyOwner`)
- Armazenamento de bots em PDAs com seed determinístico
- Funções auxiliares foram desacopladas em contratos dedicados, fortalecendo a separação de responsabilidades

---

## Integração entre Contratos via CPI
As funcionalidades auxiliares removidas deste contrato devem ser acessadas por meio de chamadas CPI. Exemplo:
```rust
let cpi_ctx = CpiContext::new(
    ctx.accounts.payments_program.to_account_info(),
    RevokeOrAllowCurrency {
        authority: ctx.accounts.authority.to_account_info(),
        bot: ctx.accounts.bot.to_account_info(),
        // ... outros campos
    }
);
payments::cpi::revoke_or_allow_currency(cpi_ctx, true)?;
```

---

## Pendências / Futuras Extensões
- Definição formal das interfaces CPI para contratos externos

---

## Conclusão
A adaptação do contrato `WEbdEXFactoryV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.