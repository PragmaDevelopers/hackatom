use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

use shared_payments::state::*;

pub fn _add_fee_tiers(
    ctx: Context<AddFeeTiers>,
    contract_address: Pubkey,
    new_fee_tiers: Vec<FeeTier>,
) -> Result<()> {
    let payments = &mut ctx.accounts.payments;

    // ✅ Se a conta payments já tinha contract_address, não sobrescreve
    if payments.contract_address == Pubkey::default() {
        payments.contract_address = contract_address;
    } else if payments.contract_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // Remove todos os tiers existentes
    payments.fee_tiers.clear();

    // Adiciona os novos
    payments.fee_tiers.extend(new_fee_tiers);

    Ok(())
}

pub fn _get_fee_tiers(ctx: Context<GetFeeTiers>) -> Result<Vec<FeeTier>> {
    let payments = &ctx.accounts.payments;
    Ok(payments.fee_tiers.clone())
}

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