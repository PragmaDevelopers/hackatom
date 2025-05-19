use anchor_lang::prelude::*;

pub mod state;
pub mod processor;
pub mod authority;

pub mod error;

use crate::state::*;
use crate::processor::*;

declare_id!("CVo61LAJcaB6BZ5oScydhG6nAnL7RPrU27EJ39uzUYuc");

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
        contract_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
        fee_withdraw_network: u64,
        fee_collector_network_address: Pubkey,
    ) -> Result<()> {
        _add_bot(ctx,name,prefix,owner,void_collector_1,void_collector_2,void_collector_3,void_collector_4,contract_address,strategy_address,sub_account_address,payments_address,token_pass_address,fee_withdraw_network,fee_collector_network_address)
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
        _get_bot_info(ctx,contract_address)
    }

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        _update_bot(ctx,strategy_address,sub_account_address,payments_address)
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
       _remove_bot(ctx)
    }
}