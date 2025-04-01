use anchor_lang::prelude::*;
use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use crate::factory::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct RevokeOrAllowCurrency<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub payments: Box<Account<'info, Payments>>,
}

#[derive(AnchorSerialize, AnchorDeserialize,Serialize, Deserialize, Clone, Default)]
pub struct FeeTier {
    pub limit: [u8; 32],
    pub fee: [u8; 32],
}

#[account]
#[derive(Serialize, Deserialize, Default)]
pub struct Payments {
    pub contract_address: Pubkey,
    pub fee_tiers: Vec<FeeTier>,
    pub coins: Vec<(Pubkey, Coins)>,
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone, Default)]
pub struct Coins {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub status: bool,
}

pub fn _revoke_or_allow_currency(ctx: Context<RevokeOrAllowCurrency>, coin_address: Pubkey, status: bool) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // Verifica se o bot está registrado
    if bot.manager_address != payments.contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    if let Some((_pubkey, coin)) = payments.coins.iter_mut().find(|(pubkey, _)| *pubkey == coin_address) {
        coin.status = status;
        Ok(())
    } else {
        Err(ErrorCode::CoinNotFound.into())
    }
}