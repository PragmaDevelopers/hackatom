use anchor_lang::prelude::*;
use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use crate::factory::*;
use crate::error::ErrorCode;

#[derive(AnchorSerialize, AnchorDeserialize, Serialize, Deserialize, Clone, Default)]
pub struct FeeTier {
    pub limit: [u8; 32],   // 32 bytes
    pub fee: [u8; 32],     // 32 bytes
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

#[account]
pub struct Payments {
    pub contract_address: Pubkey,            // 32 bytes
    pub fee_tiers: Vec<FeeTier>,             // 4 (len) + N * FeeTier
    pub coins: Vec<CoinData>,         // 4 (len) + N * (32 + Coins)
}

pub const MAX_FEE_TIERS: usize = 10;
pub const MAX_COINS: usize = 10;

impl Payments {
    pub const INIT_SPACE: usize = 8 // Anchor discriminator
        + 32 // contract_address
        + 4 + MAX_FEE_TIERS * 64 // fee_tiers
        + 4 + MAX_COINS * (32 + 52); // coins (Pubkey + Coins)
}

#[derive(Accounts)]
pub struct RevokeOrAllowCurrency<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub payments: Box<Account<'info, Payments>>,
}