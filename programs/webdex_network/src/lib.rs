use anchor_lang::prelude::*;

pub mod state;

pub mod processor;

pub mod error;

use crate::state::*;
use crate::processor::*;

declare_id!("CFGdoedbnF9ar7WaEvubtSmXpoTx8o3CpafhAdsVCuhK");

#[program]
pub mod webdex_network {

    use super::*;

    pub fn pay_fee(
        ctx: Context<PayFee>,
        contract_address: Pubkey,
        amount: u64,
        id: String,
    ) -> Result<()> {
        _pay_fee(ctx,contract_address,amount,id)
    }

    pub fn withdrawal(
        ctx: Context<Withdrawal>, 
        contract_address: Pubkey, 
        amount: u64
    ) -> Result<()> {
        _withdrawal(ctx,contract_address,amount)
    }
}