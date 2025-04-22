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