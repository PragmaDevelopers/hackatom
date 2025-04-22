use anchor_lang::prelude::*;
use serde::{Deserialize, Serialize};

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