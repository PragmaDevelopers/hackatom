**Documentação Técnica: Migração do Contrato WEbdEXPaymentsV4 (EVM) para Anchor/Solana**

---

## Objetivo
Este documento descreve a migração do contrato inteligente `WEbdEXPaymentsV4` desenvolvido para a EVM (Ethereum Virtual Machine) para a blockchain Solana utilizando o framework Anchor. A adaptação visa manter a funcionalidade equivalente dentro do ecossistema Solana com as devidas mudanças de paradigma.

---

## Estrutura Original (EVM)

### Funções do Contrato:
1. `revokeOrAllowCurrency(...)`
2. `addFeeTiers(...)`
3. `calculateFee(...)`
4. `openPosition(...)`

### Armazenamento:
- Mapeamento: `mapping(address => IPayments.Bot) internal bots;`
- Estrutura `Bot` com campos:
  - `contractAddress`, `feeTiers`, `coins`

---

## Adaptação Solana (Anchor Framework)

### Módulos:
- `state.rs`: define a estrutura `Coins`, conta principal e dados persistentes
- `processor.rs`: implementação da lógica das instruções
- `error.rs`: definição de erros personalizados com Anchor

### Instruções Migradas:
1. `add_fee_tiers`  → Adiciona `FeeTier` de um bot
2. `get_fee_tiers` → Faz o get dos `FeeTier` de um bot
3. `currency_allow` → Cria/Permite uma `Coins`
4. `currency_revoke` → Cria/Revoga uma `Coins`
5. `remove_coin` → Deleta uma `Coins`
6. `open_position` → Atualiza o saldo de uma `SubAccount`

### Declaração do Programa:
```rust
#[program]
pub mod webdex_payments {
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
pub struct RevokeOrAllowCurrency<'info> {
    pub bot: Account<'info, Bot>,
    #[account(
        init_if_needed,
        payer = signer,
        space = Payments::INIT_SPACE, // ou calcule o espaço necessário
        seeds = [b"payments", bot.key().as_ref()], // exemplo de seeds
        bump
    )]
    pub payments: Account<'info, Payments>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

---

## Integração entre Contratos via CPI
Por questão de incompatibilidade na estrutura entre os contratos, chamar a função `rebalancePosition` em `openPosition` não foi possivel. O uso de uma `mint::authority` que é PDA impossibilitou a chamada, agora feita separadamente pelo front-end:
```rust
manager(contractAddress).rebalancePosition(
    user,
    amount,
    gas,
    coin,
    fee
);
```

---

## Conclusão
A adaptação do contrato `WEbdEXPaymentsV4` para Solana com Anchor foi estruturada mantendo as funcionalidades centrais do sistema. Funções auxiliares foram migradas para contratos dedicados e podem ser acessadas via CPI, promovendo um design modular, seguro e alinhado às boas práticas de desenvolvimento na Solana.
