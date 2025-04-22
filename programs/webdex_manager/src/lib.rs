use anchor_lang::prelude::*;

pub mod processor;
pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

declare_id!("6RuoSrSkzbTyMTdVzXp1xn2gyH4h9FtdZ8iQa12jmZqp");

#[program]
pub mod webdex_manager {

    use super::*;

    pub fn register_manager(ctx: Context<RegisterManager>, manager: Pubkey) -> Result<()> {
        _register_manager(ctx,manager)
    }

    pub fn register(ctx: Context<Register>, manager: Pubkey) -> Result<()> {
        _register(ctx,manager)
    }

    pub fn liquidity_add(
        ctx: Context<LiquidityAdd>,
        strategy_token: Pubkey,
        _decimals: u8,
        amount: u64,
    ) -> Result<()> {
        _liquidity_add(ctx,strategy_token,_decimals,amount)
    }
}