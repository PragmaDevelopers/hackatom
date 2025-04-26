use anchor_lang::prelude::*;
use serde::{Deserialize, Serialize};

use shared_factory::state::{Bot};
use shared_manager::state::{User};

use webdex_strategy::state::{StrategyList};
use webdex_sub_accounts::state::{SubAccount,StrategyBalanceList};

use anchor_spl::token::{Token,TokenAccount,Mint};
use anchor_spl::associated_token::AssociatedToken;

#[account]
pub struct Payments {
    pub contract_address: Pubkey,     
    pub fee_tiers: Vec<FeeTier>,          
    pub coins: Vec<CoinData>,        
}

pub const MAX_FEE_TIERS: usize = 10;
pub const MAX_COINS: usize = 10;

impl Payments {
    pub const INIT_SPACE: usize = 8  // discriminator
        + 32                         // contract_address
        + 4 + MAX_FEE_TIERS * 64     // Vec<FeeTier>: 4 + n * 64
        + 4 + MAX_COINS * (32 + 52); // coins (Pubkey + Coins)
}

#[derive(AnchorSerialize, AnchorDeserialize, Serialize, Deserialize, Clone, Default)]
pub struct FeeTier {
    pub limit: u64,
    pub fee: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Coins {
    pub name: String,          // 4 + name.len()
    pub symbol: String,        // 4 + symbol.len()
    pub decimals: u8,          // 1
    pub status: bool,          // 1
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct CoinData {
    pub pubkey: Pubkey,
    pub coin: Coins,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Currencys {
    pub from: Pubkey,
    pub to: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct PositionDetails {
    pub strategy: Pubkey,
    pub coin: Pubkey,
    pub old_balance: u64,
    pub fee: u64,
    pub gas: u64,
    pub profit: i64,
}

#[derive(Accounts)]
pub struct AddFeeTiers<'info> {
    #[account(mut)]
    pub payments: Account<'info, Payments>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetFeeTiers<'info> {
    pub payments: Account<'info, Payments>,
}

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

#[derive(Accounts)]
pub struct RemoveCoin<'info> {
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub payments: Account<'info, Payments>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct OpenPosition<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,

    pub payments: Account<'info, Payments>,

    pub strategy_list: Account<'info, StrategyList>, 

    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>, 

    #[account(mut)]
    pub user: Account<'info, User>,

    #[account(mut)]
    /// CHECK: PDA criada no programa `manager`
    pub lp_token: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: PDA criada no programa `manager`
    pub user_lp_token_account: AccountInfo<'info>,

    #[account(mut)]
    /// CHECK: É usado como signer programático
    pub bot_owner: AccountInfo<'info>,

    #[account(mut,signer)]
    /// CHECK: É usado como signer programático
    pub lp_mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

    /// CHECK: CPI calls
    pub sub_account_program: AccountInfo<'info>,

    /// CHECK: CPI calls
    pub manager_program: AccountInfo<'info>,
}

#[event]
pub struct OpenPositionEvent {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub old_balance: u64,
    pub fee: u64,
    pub gas: u64,
    pub profit: u64,
}

#[event]
pub struct TraderEvent {
    pub contract_address: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}