use anchor_lang::prelude::*;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub void_collector_1: Pubkey,
    pub void_collector_2: Pubkey,
    pub void_collector_3: Pubkey,
    pub void_collector_4: Pubkey,
    pub fee_withdraw_void: u64,
    pub manager_address: Pubkey,
    pub strategy_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
    pub fee_withdraw_network: u64,
    pub fee_collector_network_address: Pubkey,
}

impl Bot {
    pub const INIT_SPACE: usize = 450;
}

// Discriminator:                     8
// name:                              4 + 36 = 40
// prefix:                            4 + 14 = 18
// owner + 12 Pubkeys:               32 * 11 = 352
// fee_withdraw_void (u64):           8
// fee_withdraw_network (u64):        8
// ---------------------------------------------
// TOTAL:                           8 + 40 + 18 + 352 + 8 + 8 = 434 bytes