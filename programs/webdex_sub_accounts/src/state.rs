use anchor_lang::prelude::*;
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use shared_sub_accounts::state::{BalanceStrategy,StrategyBalanceList,SubAccount};
use webdex_strategy::state::{StrategyList};
use webdex_payments::state::{Payments};

#[account]
pub struct TemporaryRebalance {
    pub fee: u64, // 8 bytes
}

impl TemporaryRebalance {
    pub const LEN: usize = 8 + 8; // = 16
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
pub struct UserSubAccountTracker {
    pub user: Pubkey,
    pub count: u8,
    pub names: Vec<String>, // opcional, se quiser impedir duplicação
}

impl UserSubAccountTracker {
    pub const MAX_SUBACCOUNTS: usize = 50;
    pub const MAX_NAME_LEN: usize = 64;

    pub const SPACE: usize =
        8  // discriminator
        + 32 // user pubkey
        + 1  // count
        + 4 + (Self::MAX_SUBACCOUNTS * (4 + Self::MAX_NAME_LEN)); // Vec<String>
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Currencys {
    pub from: Pubkey,
    pub to: Pubkey,
}

#[event]
pub struct CreateSubAccountEvent {
    pub user: Pubkey,
    pub id: Pubkey,
    pub name: String,
}

#[event]
pub struct AddAndRemoveLiquidityEvent {
    pub id: Pubkey,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub amount: u64,
    pub increase: bool,
    pub is_operation: bool,
}

#[event]
pub struct BalanceLiquidityEvent {
    pub id: Pubkey,
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
    pub id: Pubkey,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub paused: bool,
}

#[event]
pub struct OpenPositionEvent {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub id: Pubkey,
    pub details: PositionDetails,
}

#[event]
pub struct TraderEvent {
    pub contract_address: Pubkey,
    pub from: Pubkey,
    pub to: Pubkey,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", bot.key().as_ref(), user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        space = UserSubAccountTracker::SPACE,
        seeds = [b"tracker", bot.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub tracker: Account<'info, UserSubAccountTracker>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(strategy_token: Pubkey)]
pub struct AddLiquidity<'info> {
    pub bot: Account<'info, Bot>,

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
pub struct GetBalance<'info> {
    pub sub_account: Account<'info, SubAccount>,
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
pub struct GetBalances<'info> {
    pub sub_account: Account<'info, SubAccount>,
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
pub struct GetSubAccountStrategies<'info> {
    pub sub_account: Account<'info, SubAccount>,
}

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
pub struct TogglePause<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct PositionLiquidity<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,

    pub payments: Account<'info, Payments>,

    pub strategy_list: Account<'info, StrategyList>, 

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>, 

    #[account(mut)]
    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = TemporaryRebalance::LEN,
        seeds = [b"temporary_rebalance", bot.key().as_ref(), user.key().as_ref(), sub_account.key().as_ref(), strategy_balance.key().as_ref(), payments.key().as_ref()],
        bump
    )]
    pub temporary_rebalance: Account<'info, TemporaryRebalance>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}