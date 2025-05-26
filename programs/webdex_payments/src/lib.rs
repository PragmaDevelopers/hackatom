use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;

use crate::processor::*;

declare_id!("Gp1yoP72LTgD3pQrnkKw9BTCTbEDC2aDWBVkjDadaV3f");

#[program]
pub mod webdex_payments {

    use super::*;

    pub fn add_fee_tiers(
        ctx: Context<AddFeeTiers>,
        new_fee_tiers: Vec<FeeTier>,
    ) -> Result<()> {
        _add_fee_tiers(ctx,new_fee_tiers)
    }

    pub fn get_fee_tiers(ctx: Context<GetFeeTiers>) -> Result<Vec<FeeTier>> {
        _get_fee_tiers(ctx)
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin_address: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin_address,true,name,symbol,decimals)
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin_address: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin_address,false,name,symbol,decimals)
    }

    pub fn remove_coin(ctx: Context<RemoveCoin>, coin_address: Pubkey) -> Result<()> {
        _remove_coin(ctx,coin_address)
    }
}