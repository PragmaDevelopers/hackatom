use anchor_lang::prelude::*;
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use shared_sub_accounts::state::{BalanceStrategy,StrategyBalanceList,SubAccount};
use webdex_strategy::state::{StrategyList};
use webdex_payments::state::{Payments};
use crate::error::ErrorCode;

#[account]
pub struct TemporaryRebalance {
    pub fee: u64, // 8 bytes
}

impl TemporaryRebalance {
    pub const LEN: usize = 8 + 8; // = 16
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SubAccountInfo {
    pub id: u64,
    pub name: String,
    pub list_strategies: Vec<Pubkey>,
    pub strategies: Vec<Pubkey>, // StrategyBalanceList
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

#[account]
pub struct SubAccountsTracker {
    pub user: Pubkey,
    pub count: u64,
}

impl SubAccountsTracker {
    pub const SPACE: usize = 8 + 32 + 8; // discriminator + pubkey + u64
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Currencys {
    pub from: Pubkey,
    pub to: Pubkey,
}

#[event]
pub struct CreateSubAccountEvent {
    pub user: Pubkey,
    pub id: u64,
    pub name: String,
}

#[event]
pub struct AddAndRemoveLiquidityEvent {
    pub account_id: u64,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub amount: u64,
    pub increase: bool,
    pub is_operation: bool,
}

#[event]
pub struct BalanceLiquidityEvent {
    pub account_id: u64,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub amount: i64,
    pub increase: bool,
    pub is_operation: bool,
}

#[event]
pub struct ChangePausedEvent {
    pub signer: Pubkey,
    pub user: Pubkey,
    pub account_id: u64,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub paused: bool,
}

#[event]
pub struct OpenPositionEvent {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub account_id: u64,
    pub details: PositionDetails,
}

#[event]
pub struct TraderEvent {
    pub contract_address: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}

#[derive(Accounts)]
pub struct InitSubAccountsTracker<'info> {
    #[account(
        mut,
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = SubAccountsTracker::SPACE,
        seeds = [b"sub_accounts_tracker", user.key().as_ref()],
        bump,
        constraint = sub_accounts_tracker.count == 0 @ ErrorCode::TrackerAlreadyInitialized
    )]
    pub sub_accounts_tracker: Account<'info, SubAccountsTracker>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccountsTracker<'info> {
    #[account(
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,
    
    #[account(
        seeds = [b"sub_accounts_tracker", user.key().as_ref()],
        bump,
    )]
    pub sub_accounts_tracker: Account<'info, SubAccountsTracker>,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,

    #[account(
        mut,
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", user.key().as_ref(), &sub_accounts_tracker.count.to_le_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [b"sub_accounts_tracker", user.key().as_ref()],
        bump,
    )]
    pub sub_accounts_tracker: Account<'info, SubAccountsTracker>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccount<'info> {
    #[account()]
    pub sub_account: Account<'info, SubAccount>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct AddLiquidity<'info> {
    #[account(
        mut,
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        space = StrategyBalanceList::SPACE,
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct GetBalance<'info> {
    #[account(
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account()]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct GetBalances<'info> {
    #[account(
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account()]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
#[instruction(account_id: u64)]
pub struct GetSubAccountStrategies<'info> {
    #[account()]
    pub sub_account: Account<'info, SubAccount>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct RemoveLiquidity<'info> {
    #[account(
        mut,
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct TogglePause<'info> {
    #[account(
        mut,
        constraint = user.status @ ErrorCode::DisabledUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(account_id: u64, strategy_token: Pubkey)]
pub struct PositionLiquidity<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,

    #[account(mut,constraint = user.status @ ErrorCode::DisabledUser)]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub payments: Account<'info, Payments>,

    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>, 

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            user.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>, 

    #[account(
        init_if_needed,
        payer = signer,
        space = TemporaryRebalance::LEN,
        seeds = [b"temporary_rebalance", bot.key().as_ref(), user.key().as_ref(), sub_account.key().as_ref(), strategy_balance.key().as_ref(),payments.key().as_ref()],
        bump
    )]
    pub temporary_rebalance: Account<'info, TemporaryRebalance>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}