use anchor_lang::prelude::{
    borsh::{BorshDeserialize, BorshSerialize},
    *,
};
use serde::{Deserialize, Serialize};

#[derive(AnchorSerialize, AnchorDeserialize,Serialize, Deserialize, Clone, Default)]
pub struct FeeTier {
    pub limit: [u8; 32],
    pub fee: [u8; 32],
}

#[derive(Accounts)]
pub struct AddFeeTiers<'info> {
    #[account(mut)]
    pub bot: Box<Account<'info, PaymentsBot>>,
}

#[account]
#[derive(Serialize, Deserialize, Default)]
pub struct PaymentsBot {
    pub contract_address: Pubkey,
    pub fee_tiers: Vec<FeeTier>,
    pub coins: Vec<(Pubkey, Coins)>,
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone, Default)]
pub struct Coins {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub status: bool,
}

#[derive(Accounts)]
pub struct RevokeOrAllowCurrency<'info> {
    #[account(mut)]
    pub bot: Box<Account<'info, PaymentsBot>>,
}