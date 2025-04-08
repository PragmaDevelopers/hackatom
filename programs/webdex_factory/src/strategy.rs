use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token};
use crate::factory::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct AddStrategy<'info> {
     #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
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

#[account]
pub struct Strategy {
    pub name: String,
    pub token_address: Pubkey,
    pub is_active: bool,
}

#[account]
pub struct StrategyList {
    pub strategies: Vec<Strategy>,
}

#[derive(Accounts)]
pub struct GetStrategies<'info> {
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct FindStrategy<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
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

pub fn _get_strategies(ctx: Context<GetStrategies>) -> Result<Vec<Strategy>> {
    let strategy_list = &ctx.accounts.strategy_list;
    Ok(strategy_list.strategies.clone())
}