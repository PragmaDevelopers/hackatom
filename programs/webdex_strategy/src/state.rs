use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use shared_factory::state::{Bot};

#[account]
pub struct Strategy {
    pub name: String,
    pub token_address: Pubkey,
    pub is_active: bool,
}

impl Strategy {
    pub const MAX_SIZE: usize = 4 + 32 + 1; // name (4 + x), token_address (32), is_active (1)
}

#[account]
pub struct StrategyList {
    pub contract_address: Pubkey,  
    pub strategies: Vec<Strategy>,
}

impl StrategyList {
    pub const MAX_STRATEGIES: usize = 10;
    pub const INIT_SPACE: usize = 8 + 32 + 4 + Self::MAX_STRATEGIES * Strategy::MAX_SIZE;
}

#[event]
pub struct StrategyAddedEvent {
    pub contract_address: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub token_address: Pubkey,
}

#[event]
pub struct StrategyStatusUpdatedEvent {
    pub contract_address: Pubkey,
    pub token_address: Pubkey,
    pub is_active: bool,
}

#[derive(Accounts)]
pub struct AddStrategy<'info> {
    pub bot: Account<'info, Bot>,

    #[account(
        init_if_needed,
        payer = signer,
        space = StrategyList::INIT_SPACE,
        seeds = [b"strategy_list", bot.key().as_ref()],
        bump
    )]
    pub strategy_list: Account<'info, StrategyList>,

    #[account(init, payer = signer, mint::decimals = 0, mint::authority = token_authority.key())]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Esta conta é verificada pelo programa Metaplex
    pub metadata_program: AccountInfo<'info>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub token_authority: Signer<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategyStatus<'info> {
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetStrategies<'info> {
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct FindStrategy<'info> {
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct DeleteStrategy<'info> {
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
    pub signer: Signer<'info>,
}