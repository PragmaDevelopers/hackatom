use anchor_lang::prelude::*;
use shared_factory::state::{Bot};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BotInfo {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub void_collector_1: Pubkey,
    pub void_collector_2: Pubkey,
    pub void_collector_3: Pubkey,
    pub void_collector_4: Pubkey,
    pub fee_withdraw_void: u64,
    pub manager_address: Pubkey,
    pub strategy_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
    pub fee_withdraw_network: u64,
    pub fee_collector_network_address: Pubkey,
}

#[event]
pub struct BotCreated {
    pub manager_address: Pubkey,
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct BotUpdated {
    pub bot: Pubkey,
    pub strategy_address: Pubkey,
    pub payments_address: Pubkey,
}

#[event]
pub struct BotRemoved {
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[derive(Accounts)]
#[instruction(manager_address: Pubkey)]
pub struct AddBot<'info> {
    #[account(
        init_if_needed,
        payer = signer,
        space = Bot::INIT_SPACE,
        seeds = [b"bot", manager_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(manager_address: Pubkey)]
pub struct GetBotInfo<'info> {
    // Essa conta já deve ter sido inicializada e conter os dados do bot
    #[account(
        seeds = [b"bot", manager_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,
}

#[derive(Accounts)]
#[instruction(manager_address: Pubkey)]
pub struct UpdateBot<'info> {
    #[account(
        mut,
        seeds = [b"bot", manager_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(manager_address: Pubkey)]
pub struct RemoveBot<'info> {
    #[account(
        mut, 
        seeds = [b"bot", manager_address.key().as_ref()],
        bump, 
        close = signer
    )]
    pub bot: Account<'info, Bot>,
    pub signer: Signer<'info>,
}