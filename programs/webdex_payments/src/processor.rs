use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

use shared_factory::state::{Bot};

pub fn assert_only_owner(signer: &Pubkey, bot: &Account<Bot>) -> Result<()> {
    require!(
        *signer == bot.owner,
        ErrorCode::Unauthorized
    );
    Ok(())
}

pub fn _add_fee_tiers<'info>(
    ctx: Context<AddFeeTiers<'info>>,
    contract_address: Pubkey,
    new_fee_tiers: Vec<FeeTier>,
) -> Result<()> {
    assert_only_owner(&ctx.accounts.signer.key(), &ctx.accounts.bot)?;

    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // ✅ Se a conta payments já tinha contract_address, não sobrescreve
    if payments.contract_address == Pubkey::default() {
        payments.contract_address = bot.manager_address;
    } else if payments.contract_address != bot.manager_address {
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

pub fn _revoke_or_allow_currency(
    ctx: Context<RevokeOrAllowCurrency>,
    coin_pubkey: Pubkey,
    status: bool,
    name: String,
    symbol: String,
    decimals: u8,
) -> Result<()> {
    assert_only_owner(&ctx.accounts.signer.key(), &ctx.accounts.bot)?;
    
    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // ✅ Se a conta payments já tinha contract_address, não sobrescreve
    if payments.contract_address == Pubkey::default() {
        payments.contract_address = bot.manager_address;
    } else if payments.contract_address != bot.manager_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // Busca índice da moeda na lista
    let index = payments.coins.iter().position(|c| c.pubkey == coin_pubkey);

    match index {
        Some(idx) => {
            // Verifica se o status já é o mesmo
            if payments.coins[idx].coin.status == status {
                return Err(ErrorCode::StatusMustBeDifferent.into());
            }

            // Atualiza o status
            payments.coins[idx].coin.status = status;
        }
        None => {
            // Se não existe ainda e status = true, registra com info básica
            let coin_data = CoinData {
                pubkey: coin_pubkey,
                coin: Coins {
                    name,
                    symbol,
                    decimals,
                    status: true,
                },
            };

            payments.coins.push(coin_data);
        }
    }

    Ok(())
}

pub fn _remove_coin(ctx: Context<RemoveCoin>, coin: Pubkey) -> Result<()> {
    assert_only_owner(&ctx.accounts.signer.key(), &ctx.accounts.bot)?;

    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // Verifica se o bot está registrado
    if bot.manager_address != payments.contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    let initial_len = payments.coins.len();
    payments.coins.retain(|c| c.pubkey != coin);

    if payments.coins.len() == initial_len {
        return Err(ErrorCode::CoinNotFound.into());
    }

    Ok(())
}