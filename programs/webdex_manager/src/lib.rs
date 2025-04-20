use anchor_lang::prelude::*;

pub mod processor;
pub mod state;

pub mod error;

use crate::processor::*;
use crate::state::*;

declare_id!("6RuoSrSkzbTyMTdVzXp1xn2gyH4h9FtdZ8iQa12jmZqp");

#[program]
pub mod webdex_manager {

    use super::*;

    pub fn register(ctx: Context<Register>, manager: Pubkey) -> Result<()> {
        _register(ctx,manager)
    }
}