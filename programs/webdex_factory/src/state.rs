use anchor_lang::prelude::*;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub manager_address: Pubkey, // manager_address
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

impl Bot {
    pub const INIT_SPACE: usize = 8 + 36 + 14 + 32 * 6;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BotInfo {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub manager_address: Pubkey, // manager_address
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[event]
pub struct BotCreated {
    pub contract_address: Pubkey,
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct BotUpdated {
    pub bot: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
}

#[event]
pub struct BotRemoved {
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[derive(Accounts)]
pub struct AddBot<'info> {
    #[account(
        init,
        payer = signer,
        space = Bot::INIT_SPACE,
        seeds = [b"bot", manager_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,

    // Essa conta é só para obter o endereço do contrato (pode ser `UncheckedAccount`)
    /// CHECK: não estamos lendo nem escrevendo
    pub manager_address: UncheckedAccount<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,
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
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveBot<'info> {
    #[account(mut, close = signer)]
    pub bot: Account<'info, Bot>,
    pub signer: Signer<'info>,
}