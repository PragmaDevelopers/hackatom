use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token};
use shared_factory::state::*;
use shared_factory::ID as FACTORY_ID;
use shared_strategy::state::*;

#[derive(Accounts)]
pub struct AddStrategy<'info> {
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
        space = StrategyList::INIT_SPACE,
        seeds = [b"strategy_list", bot.key().as_ref()],
        bump
    )]
    pub strategy_list: Account<'info, StrategyList>,

    #[account(init, payer = owner, mint::decimals = 0, mint::authority = token_authority.key())]
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Esta conta é verificada pelo programa Metaplex
    // pub metadata_program: AccountInfo<'info>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    // #[account(mut)]
    // pub metadata: UncheckedAccount<'info>,

    #[account(mut)]
    pub token_authority: Signer<'info>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: 
    pub contract_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategyStatus<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
    pub owner: Signer<'info>,
    /// CHECK: 
    pub contract_address: AccountInfo<'info>,
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
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
    pub owner: Signer<'info>,
    /// CHECK: 
    pub contract_address: AccountInfo<'info>,
}