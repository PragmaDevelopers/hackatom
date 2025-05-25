use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;
use crate::processor::*;

declare_id!("4SqHQNaCovQM1XTfPFFb2sMc4mhnkFL2Khz5JQT4D6M8");

#[program]
pub mod webdex_network {

    use super::*;

    pub fn pay_fee(
        ctx: Context<PayFee>,
        contract_address: Pubkey,
        token: Pubkey,
        amount: u64,
    ) -> Result<()> {
        _pay_fee(ctx,contract_address,token,amount)
    }

    pub fn withdrawal(
        ctx: Context<Withdrawal>, 
        amount: u64
    ) -> Result<()> {
        _withdrawal(ctx,amount)
    }

    pub fn get_balance(
        ctx: Context<GetBalance>, 
    ) -> Result<BalanceData> {
        _get_balance(ctx)
    }
}