use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token};
use crate::factory::*;
use crate::error::ErrorCode;

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

#[derive(Accounts)]
pub struct AddStrategy<'info> {
     #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(
        init_if_needed,
        payer = payer,
        space = StrategyList::INIT_SPACE,
        seeds = [b"strategy_list", bot.key().as_ref()],
        bump
    )]
    pub strategy_list: Account<'info, StrategyList>,
    #[account(init, payer = payer, mint::decimals = 0, mint::authority = token_authority.key())]
    pub token_mint: Account<'info, Mint>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    pub metadata_program: AccountInfo<'info>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub token_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategyStatus<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct FindStrategy<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct GetStrategies<'info> {
    pub strategy_list: Account<'info, StrategyList>,
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