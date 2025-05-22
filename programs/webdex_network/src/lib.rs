use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;
use crate::processor::*;

declare_id!("66E8D8LRoAwze5aAURujjiKgMMFDejZADFzoX8sRSBwp");

#[program]
pub mod webdex_network {

    use super::*;

    pub fn pay_fee(
        ctx: Context<PayFee>,
        contract_address: Pubkey,
        amount: u64,
    ) -> Result<()> {
        _pay_fee(ctx,contract_address,amount)
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