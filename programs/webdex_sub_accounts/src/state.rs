use anchor_lang::prelude::*;
use webdex_factory::state::*;
use webdex_payments::state::*;
use shared_manager::state::*;
use anchor_spl::token::{Mint, Token,TokenAccount};
use anchor_spl::associated_token::AssociatedToken;

#[account]
pub struct BalanceStrategy {
    pub amount: u64,
    pub token: Pubkey,
    pub decimals: u8,
    pub ico: String,
    pub name: String,
    pub status: bool,
    pub paused: bool,
}

impl BalanceStrategy {
    pub const SPACE: usize = 8    // amount: u64
        + 32                      // token
        + 1                       // decimals
        + 4 + 64                  // ico string
        + 4 + 64                  // name string
        + 1                       // status
        + 1;                      // paused
    // TOTAL: 175 bytes
}

#[account]
pub struct StrategyBalanceList {
    pub strategy_token: Pubkey,
    pub status: bool,
    pub list_coins: Vec<Pubkey>,
    pub balance: Vec<BalanceStrategy>,
}

impl StrategyBalanceList {
    pub const MAX_LIST_COINS: usize = 10; // Tokens aceitos pela estratégia - USDT - LP - WEBDEX
    pub const MAX_BALANCES: usize = 10; // Informações detalhadas de cada token que tem saldo ou foi operado - USDT

    pub const SPACE: usize = 1 // status
        + 32 // strategy_token
        + 4 + (Self::MAX_LIST_COINS * 32) // list_coins
        + 4 + (Self::MAX_BALANCES * BalanceStrategy::SPACE); // balance
}

#[account]
pub struct SubAccount {
    pub id: String,
    pub name: String,
    pub list_strategies: Vec<Pubkey>,
    pub strategies: Vec<Pubkey>, // StrategyBalanceList
}

impl SubAccount {
    pub const MAX_ID_LEN: usize = 64; // Defina o comprimento máximo esperado para 'id'
    pub const MAX_STRATEGIES: usize = 10; // Número máximo de estratégias

    pub const SPACE: usize = 8 // discriminador
        + 4 + Self::MAX_ID_LEN // id
        + 4 + Self::MAX_ID_LEN // name
        + 4 + (Self::MAX_STRATEGIES * 32); // strategy_refs
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SimpleSubAccount {
    pub sub_account_address: Pubkey,
    pub id: String,
    pub name: String,
}

#[account]
pub struct SubAccountList {
    pub contract_address: Pubkey,
    pub sub_accounts: Vec<SimpleSubAccount>,
}

impl SubAccountList {
    pub const MAX_SUBACCOUNTS: usize = 50;
    pub const MAX_ID_LEN: usize = 64;
    pub const MAX_NAME_LEN: usize = 64;

    pub const SPACE: usize = 8 // discriminator
        + 32 // contract_address
        + 4 // len of vec
        + Self::MAX_SUBACCOUNTS * (
            32 // key
            + 4 + Self::MAX_ID_LEN // id (String)
            + 4 + Self::MAX_NAME_LEN // name (String)
        );
}

#[event]
pub struct CreateSubAccountEvent {
    pub signer: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub name: String,
}

#[event]
pub struct BalanceLiquidityEvent {
    pub signer: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub amount: u64,
    pub increase: bool,
    pub is_operation: bool,
}

#[event]
pub struct ChangePausedEvent {
    pub signer: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub paused: bool,
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    #[account(
        init_if_needed,
        payer = signer,
        space = SubAccountList::SPACE,
        seeds = [b"sub_account_list", user.key().as_ref()],
        bump
    )]
    pub sub_account_list: Account<'info, SubAccountList>,

    #[account(
        init,
        payer = signer,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: usado para validação
    pub manager_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccounts<'info> {
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
pub struct FindSubAccountIndex<'info> {
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
#[instruction(strategy_token: Pubkey, decimals: u8, coin: Pubkey,sub_account_name: String)]
pub struct AddLiquidity<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"sub_account", user.key().as_ref(), sub_account_name.as_bytes()],
        bump,
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = coin,
        associated_token::authority = sub_account
    )]
    pub vault_account: Account<'info, TokenAccount>,

    pub coin: Account<'info, Mint>,

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

    #[account(
        init_if_needed,
        payer = signer,
        seeds = [b"lp_token", sub_account.key().as_ref(), strategy_token.as_ref(), coin.key().as_ref()],
        bump,
        mint::decimals = decimals,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority
    )]
    pub lp_token: Account<'info, Mint>,

    /// CHECK: Autoridade do mint
    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    pub mint_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = lp_token,
        associated_token::authority = signer
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK
    pub manager_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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
#[instruction(account_id: String, strategy_token: Pubkey, coin: Pubkey,sub_account_name:String)]
pub struct RemoveLiquidity<'info> {
    pub bot: Account<'info, Bot>,
    pub user: Account<'info, User>,

    #[account(
        mut,
        seeds = [b"sub_account", user.key().as_ref(), sub_account_name.as_bytes()],
        bump,
    )]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub lp_token: Account<'info, Mint>,

    #[account(mut)]
    pub user_lp_token_account: Account<'info, TokenAccount>, // LP token do usuário

    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>, // Vault da subconta

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>, // Conta do usuário pra receber os tokens de volta

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK:
    pub manager_address: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct TogglePause<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: usado para validação
    pub manager_address: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct PositionLiquidity<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: usado para validação
    pub manager_address: AccountInfo<'info>,
}