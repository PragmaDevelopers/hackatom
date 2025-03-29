#![allow(unexpected_cfgs)]

mod processor {
    pub mod factory;
    pub mod payments;
}

mod state {
    pub mod factory;
    pub mod payments;
}

use anchor_lang::prelude::*;
use crate::state::factory::*;
use crate::state::payments::*;

declare_id!("D8CM6w2X7mcpf5zb6mENi6JB8h3HohPhkgAgAbVwtGN7");


#[program]
pub mod webdexfactory {

    use super::*;

    pub fn add_bot(
        ctx: Context<AddBot>,
        name: String,
        prefix: String,
        owner: Pubkey,
        contract_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
    ) -> Result<()> {
        FactoryBot::add_bot(
            ctx,
            name,
            prefix,
            owner,
            contract_address,
            strategy_address,
            sub_account_address,
            payments_address,
            token_pass_address,
        )
    }

    pub fn add_fee_tiers(ctx: Context<AddFeeTiers>, new_fee_tiers: Vec<FeeTier>) -> Result<()> {
        PaymentsBot::add_fee_tiers(ctx, new_fee_tiers)
    }

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        FactoryBot::update_bot(ctx, strategy_address, sub_account_address, payments_address)
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
        FactoryBot::remove_bot(ctx)
    }

    pub fn process_bot_info(
        ctx: Context<GetBotInfo>,
        contract_address: Pubkey,
    ) -> Result<FactoryBot> {
        // Chama a função get_bot_info do módulo FactoryBot
        FactoryBot::get_bot_info(ctx, contract_address)
    }
}
