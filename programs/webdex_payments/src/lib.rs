use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;

use crate::processor::*;

use shared_payments::state::*;

declare_id!("AVHdHmVQS5r9s4rq8D5XdkVmD97hXkvGzpeau2idxkL1");

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

    pub fn add_coin(
        ctx: Context<RevokeOrAllowCurrency>,
        pub_key: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _add_coin(ctx,pub_key,name,symbol,decimals)
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin,true)
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin,false)
    }

    pub fn remove_coin(ctx: Context<RevokeOrAllowCurrency>, coin: Pubkey) -> Result<()> {
        _remove_coin(ctx,coin)
    }
}