use anchor_lang::prelude::*;

pub mod processor;

pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

declare_id!("CVuroprVgA34wFb5kdQbFcfV4vyk6AfMvcpWkvVnNApK");

#[program]
pub mod webdex_strategy {

    use super::*;

    pub fn add_strategy(
        ctx: Context<AddStrategy>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        _add_strategy(ctx,name,symbol,uri)
    }

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, token_address: Pubkey, is_active: bool) -> Result<()> {
        _update_strategy_status(ctx,token_address,is_active)
    }

    pub fn get_strategies(ctx: Context<GetStrategies>) -> Result<Vec<Strategy>> {
        _get_strategies(ctx)
    }

    pub fn find_strategy(
        ctx: Context<FindStrategy>,
        token_address: Pubkey,
    ) -> Result<Strategy> {
        _find_strategy(ctx,token_address)
    }

    pub fn delete_strategy(
        ctx: Context<DeleteStrategy>,
        token_address: Pubkey,
    ) -> Result<()> {
        _delete_strategy(ctx,token_address)
    }
}