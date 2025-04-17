use anchor_lang::prelude::*;
use shared_factory::state::*;
use shared_payments::state::*;
use shared_factory::ID as FACTORY_ID;

#[derive(Accounts)]
pub struct AddFeeTiers<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,

    #[account(
        init_if_needed,
        payer = owner,
        space = Payments::INIT_SPACE, // ou calcule o espaço necessário
        seeds = [b"payments", bot.key().as_ref()], // exemplo de seeds
        bump
    )]
    pub payments: Box<Account<'info, Payments>>,

    // Essa conta é só para obter o endereço do contrato (pode ser `UncheckedAccount`)
    /// CHECK: não estamos lendo nem escrevendo
    pub contract_address: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetFeeTiers<'info> {
    pub payments: Account<'info, Payments>,
}

#[derive(Accounts)]
pub struct RevokeOrAllowCurrency<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,
   #[account(mut)]
    pub payments: Box<Account<'info, Payments>>,
    pub owner: Signer<'info>,
    // Essa conta é só para obter o endereço do contrato (pode ser `UncheckedAccount`)
    /// CHECK: não estamos lendo nem escrevendo
    pub contract_address: UncheckedAccount<'info>,
}