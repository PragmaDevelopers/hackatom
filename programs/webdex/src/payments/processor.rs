use anchor_lang::prelude::*;

use crate::payments::state::{RevokeOrAllowCurrency,Coins,CoinData};
use crate::error::ErrorCode;

pub fn _add_coin(
    ctx: Context<RevokeOrAllowCurrency>,
    pub_key: Pubkey,
    name: String,
    symbol: String,
    decimals: u8,
) -> Result<()> {
    let payments = &mut ctx.accounts.payments;

    // Verifica se já existe
    if payments.coins.iter().any(|c| c.pubkey == pub_key) {
        return Err(ErrorCode::CoinAlreadyExists.into());
    }

    let new_coin = Coins {
        name,
        symbol,
        decimals,
        status: false, // começa como desativado
    };

    payments.coins.push(CoinData {
        pubkey: pub_key,
        coin: new_coin,
    });

    Ok(())
}

pub fn _revoke_or_allow_currency(ctx: Context<RevokeOrAllowCurrency>, coin: Pubkey, status: bool) -> Result<()> {
    // Preparando os dados para a chamada CPI
    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.owner.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // Verifica se o bot está registrado
    if bot.contract_address != payments.contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    if let Some(c) = payments.coins.iter_mut().find(|c| c.pubkey == coin) {
        c.coin.status = status;
        Ok(())
    } else {
        Err(ErrorCode::CoinNotFound.into())
    }
}

pub fn _remove_coin(ctx: Context<RevokeOrAllowCurrency>, coin: Pubkey) -> Result<()> {
    let payments = &mut ctx.accounts.payments;

    let initial_len = payments.coins.len();
    payments.coins.retain(|c| c.pubkey != coin);

    if payments.coins.len() == initial_len {
        return Err(ErrorCode::CoinNotFound.into());
    }

    Ok(())
}