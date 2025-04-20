use anchor_lang::prelude::*;

#[account]
pub struct User {
    pub manager: Pubkey,
    pub gas_balance: u64,
    pub pass_balance: u64,
    pub status: bool,
}

impl User {
    pub const SPACE: usize = 32   // manager: Pubkey
        + 32                   // gas_balance: [u8; 32]
        + 32                   // pass_balance: [u8; 32]
        + 1;                   // status: bool
}