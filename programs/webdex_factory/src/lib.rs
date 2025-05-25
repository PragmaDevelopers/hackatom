use anchor_lang::prelude::*;

pub mod state;
pub mod processor;

pub mod error;

use crate::state::*;
use crate::processor::*;

declare_id!("9i1mJt5ioM5RaffYiQxLdv1dQnotfoDXDzENZnGsoqjX");

#[program]
pub mod webdex_factory {

    use super::*;

    pub fn add_bot(
        ctx: Context<AddBot>,
        name: String,
        prefix: String,
        owner: Pubkey,
        void_collector_1: Pubkey,
        void_collector_2: Pubkey,
        void_collector_3: Pubkey,
        void_collector_4: Pubkey,
        fee_withdraw_void: u64,
        contract_address: Pubkey,
        strategy_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
        fee_withdraw_network: u64,
        fee_collector_network_address: Pubkey,
    ) -> Result<()> {
        _add_bot(ctx,name,prefix,owner,void_collector_1,void_collector_2,void_collector_3,void_collector_4,fee_withdraw_void,contract_address,strategy_address,payments_address,token_pass_address,fee_withdraw_network,fee_collector_network_address)
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
        _get_bot_info(ctx,contract_address)
    }

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        _update_bot(ctx,strategy_address,payments_address)
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
       _remove_bot(ctx)
    }
}