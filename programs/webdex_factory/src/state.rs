use anchor_lang::prelude::*;

use shared_factory::state::*;

#[derive(Accounts)]
pub struct AddBot<'info> {
    #[account(
        init,
        payer = owner,
        space = Bot::INIT_SPACE,
        seeds = [b"bot", contract_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,

    // Essa conta é só para obter o endereço do contrato (pode ser `UncheckedAccount`)
    /// CHECK: não estamos lendo nem escrevendo
    pub contract_address: UncheckedAccount<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetBotInfo<'info> {
    // Essa conta já deve ter sido inicializada e conter os dados do bot
    #[account()]
    pub bot: Account<'info, Bot>,
}

#[derive(Accounts)]
pub struct UpdateBot<'info> {
    #[account(mut, has_one = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveBot<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}