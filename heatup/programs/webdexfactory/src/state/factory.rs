use anchor_lang::prelude::*;

#[account]
pub struct FactoryBot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub contract_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[derive(Accounts)]
pub struct GetBotInfo<'info> {
    #[account()]
    pub bot: Account<'info, FactoryBot>,
}

#[derive(Accounts)]
pub struct AddBot<'info> {
    // O modificador #[account(init, ...)] garante que a conta não pode existir antes da criação.
    #[account(init, payer = user, space = 1024)]
    pub bot: Account<'info, FactoryBot>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBot<'info> {
    #[account(mut, has_one = owner)]
    pub bot: Account<'info, FactoryBot>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveBot<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub bot: Account<'info, FactoryBot>,
    pub owner: Signer<'info>,
}