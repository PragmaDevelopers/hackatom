use anchor_lang::prelude::*;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub contract_address: Pubkey, // manager_address
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

impl Bot {
    pub const INIT_SPACE: usize = 8 + 36 + 14 + 32 * 6;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BotInfo {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub contract_address: Pubkey, // manager_address
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[event]
pub struct BotCreated {
    pub contract_address: Pubkey,
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct BotUpdated {
    pub bot: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
}

#[event]
pub struct BotRemoved {
    pub bot: Pubkey,
    pub owner: Pubkey,
}