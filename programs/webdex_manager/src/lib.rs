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

    pub fn get_info_user(ctx: Context<GetInfoUser>) -> Result<UserDisplay> {
        _get_info_user(ctx)
    }

    pub fn add_gas(ctx: Context<AddGas>, amount: u64) -> Result<()> {
        _add_gas(ctx,amount)
    }

    pub fn remove_gas(ctx: Context<RemoveGas>, amount: u64) -> Result<()> {
        _remove_gas(ctx,amount)
    }

    pub fn pass_add(ctx: Context<PassAdd>, amount: u64) -> Result<()> {
        _pass_add(ctx,amount)
    }

    pub fn pass_remove(ctx: Context<PassRemove>, amount: u64) -> Result<()> {
        _pass_remove(ctx,amount)
    }

    pub fn liquidity_add(
        ctx: Context<LiquidityAdd>,
        strategy_token: Pubkey,
        _decimals: u8,
        amount: u64,
    ) -> Result<()> {
        _liquidity_add(ctx,strategy_token,_decimals,amount)
    }

    pub fn liquidity_remove(
        ctx: Context<LiquidityRemove>,
        account_id: String,
        strategy_token: Pubkey,
        coin: Pubkey, // Token base, por exemplo, USDT
        amount: u64,
    ) -> Result<()> {
        _liquidity_remove(ctx,account_id,strategy_token,coin,amount)
    }
}