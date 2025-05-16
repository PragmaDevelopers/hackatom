use anchor_lang::prelude::*;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub collector_1: Pubkey,
    pub collector_2: Pubkey,
    pub collector_3: Pubkey,
    pub collector_4: Pubkey,
    pub manager_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
    pub fee_withdraw_network: u64,
    pub fee_collector_network_address: Pubkey,
}

impl Bot {
    pub const INIT_SPACE: usize = 8 + 36 + 14 + 32 * 12 + 8;
}