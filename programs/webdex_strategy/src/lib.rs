use anchor_lang::prelude::*;

pub mod processor;

pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

declare_id!("418sMdM3mq48AdsMgNpt6gNp6q3vNNcyUB3THzqQmSgH");

#[program]
pub mod webdex_strategy {

    use super::*;

    pub fn add_strategy(
        ctx: Context<AddStrategy>,
        name: String,
        symbol: String,
        uri: String,
        contract_address: Pubkey,
    ) -> Result<()> {
        _add_strategy(ctx,name,symbol,uri,contract_address)
    }

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
        _update_strategy_status(ctx,contract_address,token_address,is_active)
    }

    pub fn get_strategies(ctx: Context<GetStrategies>, contract_address: Pubkey) -> Result<Vec<Strategy>> {
        _get_strategies(ctx,contract_address)
    }

    pub fn find_strategy(
        ctx: Context<FindStrategy>,
        contract_address: Pubkey,
        token_address: Pubkey,
    ) -> Result<Strategy> {
        _find_strategy(ctx,contract_address,token_address)
    }

    pub fn delete_strategy(
        ctx: Context<DeleteStrategy>,
        contract_address: Pubkey,
        token_address: Pubkey,
    ) -> Result<()> {
        _delete_strategy(ctx,contract_address,token_address)
    }
}