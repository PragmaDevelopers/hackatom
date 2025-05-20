use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;

use crate::processor::*;

declare_id!("24xr25kWdRkLFZTfsxjrpyQWfezn3Eof65VaM9D7FXiy");

#[program]
pub mod webdex_payments {

    use super::*;

    pub fn add_fee_tiers(
        ctx: Context<AddFeeTiers>,
        contract_address: Pubkey,
        new_fee_tiers: Vec<FeeTier>,
    ) -> Result<()> {
        _add_fee_tiers(ctx,contract_address,new_fee_tiers)
    }

    pub fn get_fee_tiers(ctx: Context<GetFeeTiers>) -> Result<Vec<FeeTier>> {
        _get_fee_tiers(ctx)
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin_pubkey: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin_pubkey,true,name,symbol,decimals)
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin_pubkey: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin_pubkey,false,name,symbol,decimals)
    }

    pub fn remove_coin(ctx: Context<RemoveCoin>, coin: Pubkey) -> Result<()> {
        _remove_coin(ctx,coin)
    }

    pub fn open_position(
        ctx: Context<OpenPosition>,
        _decimals: u8,
        account_id: String,
        strategy_token: Pubkey,
        amount: u64,
        coin: Pubkey,
        gas: u64,
        currrencys: Vec<Currencys>,
    ) -> Result<()> {
        _open_position(ctx,_decimals,account_id,strategy_token,amount,coin,gas,currrencys)
    }
}