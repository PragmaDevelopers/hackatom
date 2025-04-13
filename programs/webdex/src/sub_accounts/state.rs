use anchor_lang::prelude::*;
use crate::factory::state::*;

#[account]
pub struct BalanceStrategy {
    pub amount: [u8; 32],
    pub token: Pubkey,
    pub decimals: [u8; 32],
    pub ico: String,
    pub name: String,
    pub status: bool,
    pub paused: bool,
}

impl BalanceStrategy {
    pub const MAX_ICO_LEN: usize = 64; // Defina o comprimento máximo esperado para 'ico'
    pub const MAX_NAME_LEN: usize = 64; // Defina o comprimento máximo esperado para 'name'

    pub const SPACE: usize = 32 // amount
        + 32 // token
        + 32 // decimals
        + 4 + Self::MAX_ICO_LEN // ico
        + 4 + Self::MAX_NAME_LEN // name
        + 1 // status
        + 1; // paused
}

#[account]
pub struct StrategyBalanceList {
    pub status: bool,
    pub list_coins: Vec<Pubkey>,
    pub balance: Vec<BalanceStrategy>,
}

impl StrategyBalanceList {
    pub const MAX_LIST_COINS: usize = 10; // Tokens aceitos pela estratégia - USDT - LP - WEBDEX
    pub const MAX_BALANCES: usize = 10; // Informações detalhadas de cada token que tem saldo ou foi operado - USDT

    pub const SPACE: usize = 1 // status
        + 4 + (Self::MAX_LIST_COINS * 32) // list_coins
        + 4 + (Self::MAX_BALANCES * BalanceStrategy::SPACE); // balance
}

#[account]
pub struct SubAccount {
    pub id: String,
    pub name: String,
    pub list_strategies: Vec<Pubkey>,
    pub strategies: Vec<StrategyBalanceList>,
}

impl SubAccount {
    pub const MAX_ID_LEN: usize = 64; // Defina o comprimento máximo esperado para 'id'
    pub const MAX_STRATEGIES: usize = 10; // Número máximo de estratégias
    pub const MAX_LIST_STRATEGIES: usize = 10; // Número máximo de 'list_strategies'

    pub const SPACE: usize = 8 // Discriminador
        + 4 + Self::MAX_ID_LEN // id
        + 4 + (Self::MAX_LIST_STRATEGIES * 32) // list_strategies
        + 4 + (Self::MAX_STRATEGIES * StrategyBalanceList::SPACE); // strategies
}

#[account]
pub struct SubAccountList {
    pub contract_address: Pubkey,
    pub sub_accounts: Vec<Pubkey>,
}

impl SubAccountList {
    pub const MAX_SUB_ACCOUNTS: usize = 50;

    pub const SPACE: usize = 8 // discriminador
        + 32 // contract_address
        + 4 + (Self::MAX_SUB_ACCOUNTS * 32); // 32 bytes por Pubkey
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SubAccountInfo {
    pub name: String,
    pub id: String,
}

// USADO SOMENTE NO WEBDEX/MANAGER
#[account]
pub struct StrategyDisplay {
    pub strategy_token: Pubkey,
    pub balance: Vec<BalanceStrategy>,
}

#[account]
pub struct SubAccountsDisplay {
    pub id: u64,
    pub name: String,
    pub strategies: Vec<StrategyDisplay>,
}
// ******

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    #[account(has_one = owner)]
    pub bot: Account<'info, Bot>,

    #[account(
        init_if_needed,
        payer = owner,
        space = SubAccountList::SPACE,
        seeds = [b"sub_account_list", bot.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub sub_account_list: Account<'info, SubAccountList>,

    #[account(
        init,
        payer = owner,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", bot.key().as_ref(), user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    /// quem é dono do bot e pagador
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: usuário que vai criar a subconta
    pub user: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccounts<'info> {
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
#[instruction(account_id: String)]
pub struct GetBalance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"sub_account_list", user.key().as_ref(), account_id.as_bytes()],
        bump,
    )]
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[event]
pub struct CreateSubAccountEvent {
    pub owner: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub name: String,
}