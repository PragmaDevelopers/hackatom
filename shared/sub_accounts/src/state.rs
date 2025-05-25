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
    pub bot: Pubkey,
    pub user: Pubkey,
    pub id: Pubkey,
    pub name: String,
    pub list_strategies: Vec<Pubkey>,
    pub strategies: Vec<Pubkey>, // StrategyBalanceList
}

impl SubAccount {
    pub const MAX_NAME_LEN: usize = 64;
    pub const MAX_STRATEGIES: usize = 10;

    pub const SPACE: usize =
        8   // discriminator
        + 32 // bot_address
        + 32 // user_address
        + 32 // id
        + 4 + Self::MAX_NAME_LEN // name
        + 4 + (32 * Self::MAX_STRATEGIES) // list_strategies
        + 4 + (32 * Self::MAX_STRATEGIES); // strategies
}