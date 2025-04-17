use anchor_lang::prelude::*;

pub mod processor;
pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

use shared_sub_accounts::state::*;
use shared_sub_accounts::ID as SUB_ACCOUNTS_ID;

declare_id!("9tgvAbnsLUZ78v5C8HzaYVZhTuPk5JqX9G2tSVjdVMYL");

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

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        account_id: String,
        strategy_token: Pubkey,
        coin: Pubkey,
        amount: u64,
        name: String,
        ico: String,
        decimals: u8,
    ) -> Result<()> {
        _add_liquidity(ctx,account_id,strategy_token,coin,amount,name,ico,decimals)
    }

    pub fn get_balance(
        ctx: Context<GetBalance>,
        account_id: String,
        strategy_token: Pubkey,
        coin: Pubkey,
    ) -> Result<BalanceStrategy> {
        _get_balance(ctx,account_id,strategy_token,coin)
    }

    pub fn get_balances(
        ctx: Context<GetBalances>,
        account_id: String,
        strategy_token: Pubkey,
    ) -> Result<Vec<BalanceStrategy>> {
        _get_balances(ctx,account_id,strategy_token)
    }

    pub fn get_sub_account_strategies(
        ctx: Context<GetSubAccountStrategies>,
        account_id: String,
    ) -> Result<Vec<Pubkey>> {
        _get_sub_account_strategies(ctx,account_id)
    }
}