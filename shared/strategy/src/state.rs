use anchor_lang::prelude::*;

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