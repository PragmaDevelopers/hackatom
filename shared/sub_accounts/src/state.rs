use anchor_lang::prelude::*;

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

#[event]
pub struct CreateSubAccountEvent {
    pub owner: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub name: String,
}

#[event]
pub struct BalanceLiquidityEvent {
    pub owner: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub strategy_token: Pubkey,
    pub coin: Pubkey,
    pub amount: u64,
    pub increase: bool,
    pub is_operation: bool,
}