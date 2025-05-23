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

    pub fn get_sub_accounts(
        ctx: Context<GetSubAccounts>,
        contract_address: Pubkey,
    ) -> Result<Vec<SimpleSubAccount>> {
        _get_sub_accounts(ctx, contract_address)
    }

    pub fn find_sub_account_index_by_id(
        ctx: Context<FindSubAccountIndex>,
        account_id: Pubkey,
    ) -> Result<i64> {
        _find_sub_account_index_by_id(ctx,account_id)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        strategy_token: Pubkey,
        account_id: Pubkey,
        coin: Pubkey,
        amount: u64,
        coin_name: String,
        coin_ico: String,
        coin_decimals: u8,
    ) -> Result<()> {
        _add_liquidity(ctx,strategy_token,account_id,coin,amount,coin_name,coin_ico,coin_decimals)
    }

    pub fn get_balance(
        ctx: Context<GetBalance>,
        account_id: Pubkey,
        strategy_token: Pubkey,
        coin: Pubkey,
    ) -> Result<BalanceStrategy> {
        _get_balance(ctx,account_id,strategy_token,coin)
    }

    pub fn get_balances(
        ctx: Context<GetBalances>,
        account_id: Pubkey,
        strategy_token: Pubkey,
    ) -> Result<Vec<BalanceStrategy>> {
        _get_balances(ctx,account_id,strategy_token)
    }

    pub fn get_sub_account_strategies(
        ctx: Context<GetSubAccountStrategies>,
        account_id: Pubkey,
    ) -> Result<Vec<Pubkey>> {
        _get_sub_account_strategies(ctx,account_id)
    }

    pub fn toggle_pause(
        ctx: Context<TogglePause>,
        account_id: Pubkey,
        strategy_token: Pubkey,
        coin: Pubkey,
        paused: bool,
    ) -> Result<()> {
        _toggle_pause(ctx,account_id,strategy_token,coin,paused)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        account_id: Pubkey,
        strategy_token: Pubkey,
        coin: Pubkey,
        amount: u64,
    ) -> Result<()> {
        _remove_liquidity(ctx,account_id,strategy_token,coin,amount)
    }
}