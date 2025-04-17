use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;
use crate::processor::*;

use shared_factory::state::*;
use shared_factory::ID as FACTORY_ID;

declare_id!("AZpLbd9HonogrHXnLqy4YSkc2Zf6BvTv1Qpn4jZrpXfM");

#[program]
pub mod webdex_factory {

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
        _add_bot(ctx,name,prefix,owner,contract_address,strategy_address,sub_account_address,payments_address,token_pass_address)
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