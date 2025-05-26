use anchor_lang::prelude::*;

pub mod processor;
pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

use shared_sub_accounts::state::{BalanceStrategy};

declare_id!("C4bmi6wrQdtHdoCXdUtFQoHpXhsMiA9uajbE4wFjDssX");

#[program]
pub mod webdex_sub_accounts {

    use super::*;

    pub fn create_sub_account(ctx: Context<CreateSubAccount>, name: String) -> Result<()> {
        _create_sub_account(ctx,name)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        account_name: String,
        strategy_token: Pubkey,
        coin: Pubkey,
        amount: u64,
        coin_name: String,
        coin_ico: String,
        coin_decimals: u8,
    ) -> Result<()> {
        _add_liquidity(ctx,account_name,strategy_token,coin,amount,coin_name,coin_ico,coin_decimals)
    }

    pub fn get_balance(
        ctx: Context<GetBalance>,
        account_name: String,
        strategy_token: Pubkey,
        coin: Pubkey,
    ) -> Result<BalanceStrategy> {
        _get_balance(ctx,account_name,strategy_token,coin)
    }

    pub fn get_balances(
        ctx: Context<GetBalances>,
        account_name: String,
        strategy_token: Pubkey,
    ) -> Result<Vec<BalanceStrategy>> {
        _get_balances(ctx,account_name,strategy_token)
    }

    pub fn get_sub_account_strategies(
        ctx: Context<GetSubAccountStrategies>,
        account_name: String,
    ) -> Result<Vec<Pubkey>> {
        _get_sub_account_strategies(ctx,account_name)
    }

    pub fn toggle_pause(
        ctx: Context<TogglePause>,
        account_name: String,
        strategy_token: Pubkey,
        coin: Pubkey,
        paused: bool,
    ) -> Result<()> {
        _toggle_pause(ctx,account_name,strategy_token,coin,paused)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        account_name: String,
        strategy_token: Pubkey,
        coin: Pubkey,
        amount: u64,
    ) -> Result<()> {
        _remove_liquidity(ctx,account_name,strategy_token,coin,amount)
    }

    pub fn position_liquidity(
        ctx: Context<PositionLiquidity>,
        account_name: String,
        strategy_token: Pubkey,
        amount: i64,
        coin: Pubkey,
        gas: u64,
        currrencys: Vec<Currencys>,
    ) -> Result<()> {
        _position_liquidity(ctx,account_name,strategy_token,amount,coin,gas,currrencys)
    }
}