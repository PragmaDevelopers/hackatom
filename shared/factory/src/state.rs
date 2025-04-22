use anchor_lang::prelude::*;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub manager_address: Pubkey, // manager_address
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

impl Bot {
    pub const INIT_SPACE: usize = 8 + 36 + 14 + 32 * 6;
}