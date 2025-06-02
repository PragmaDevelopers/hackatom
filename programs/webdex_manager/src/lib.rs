use anchor_lang::prelude::*;

pub mod processor;
pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

declare_id!("rsnfy8DoYNs32o8v7WeCTbDCxZkqYirxgeqwkuEe5Ba");

#[program]
pub mod webdex_manager {

    use super::*;

    pub fn register(ctx: Context<Register>) -> Result<()> {
        _register(ctx)
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
        strategy_token: Pubkey,
        _decimals: u8,
        amount: u64,
    ) -> Result<()> {
        _liquidity_remove(ctx,strategy_token,_decimals,amount)
    }

    pub fn rebalance_position(
        ctx: Context<RebalancePosition>,
        _strategy_token: Pubkey,
        _decimals: u8, // USADO NA STRUCT EM lp_token
        amount: u64,
        gas: u64,
    ) -> Result<()> {
        _rebalance_position(ctx,_strategy_token,_decimals,amount,gas)
    }
}