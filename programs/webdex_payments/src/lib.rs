use anchor_lang::prelude::*;
use webdex_common::factory::*;
use webdex_common::payments::*;
use webdex_common::error::ErrorCode;

declare_id!("9MUsHPBR22Dorhi7Thq1ewPoFm4Uzx8JmsDZvVeWuwiF");

#[cfg(feature = "use_global_allocator")]
#[program]
pub mod webdex_payments {

    use super::*;

    pub fn revoke_or_allow_currency(ctx: Context<RevokeOrAllowCurrency>, coin_address: Pubkey, status: bool) -> Result<()> {
        payments::_revoke_or_allow_currency(ctx,coin_address,status)
    }
}
