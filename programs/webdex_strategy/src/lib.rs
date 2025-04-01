mod state;

use anchor_lang::prelude::*;
use webdex_common::strategy::*;
use webdex_common::error::ErrorCode;

declare_id!("5ozi32fjP7BEngQ2A2dbQrt98CYuhsq9kL4tmGt79URs");

#[program]
pub mod webdex_strategy {

    use super::*;

    pub fn add_strategy(ctx: Context<AddStrategy>, name: String, contract_address: Pubkey) -> Result<()> {
        strategy::_add_strategy(ctx,name,contract_address)
    }

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
        strategy::_update_strategy_status(ctx,contract_address,token_address,is_active)
    }

    pub fn get_strategies(ctx: Context<GetStrategies>) -> Result<Vec<Strategy>> {
        strategy::_get_strategies(ctx)
    }

    pub fn find_strategy(
        ctx: Context<FindStrategy>,
        contract_address: Pubkey,
        token_address: Pubkey,
    ) -> Result<Strategy> {
        strategy::_find_strategy(ctx,contract_address,token_address)
    }
}
