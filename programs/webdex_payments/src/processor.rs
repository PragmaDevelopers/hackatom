use anchor_lang::prelude::*;

use crate::state::*;
use crate::error::ErrorCode;

use webdex_manager::{state::RebalancePosition, processor::_rebalance_position};
use webdex_sub_accounts::{state::PositionLiquidity, processor::_position_liquidity, program::WebdexSubAccounts};

pub fn _add_fee_tiers<'info>(
    ctx: Context<AddFeeTiers<'info>>,
    contract_address: Pubkey,
    new_fee_tiers: Vec<FeeTier>,
) -> Result<()> {
    let payments = &mut ctx.accounts.payments;

    // Verifica se o bot está registrado
    if payments.contract_address != contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    // Remove todos os tiers existentes
    payments.fee_tiers.clear();

    // Adiciona os novos
    payments.fee_tiers.extend(new_fee_tiers);

    Ok(())
}

pub fn _calculate_fee(payments: &Payments, value: u64) -> u64 {
    for tier in &payments.fee_tiers {
        if value <= tier.limit {
            return tier.fee;
        }
    }

    // Se nenhum limite bateu, retorna o último tier
    return payments.fee_tiers
        .last()
        .map(|tier| tier.fee)
        .unwrap_or(0) // retorna 0 se não houver tiers
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
    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() && bot.manager_address != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

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
    let bot = &ctx.accounts.bot;
    let payments = &mut ctx.accounts.payments;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() && bot.manager_address != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

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

pub fn _open_position(
    ctx: Context<OpenPosition>,
    account_id: String,
    strategy_token: Pubkey,
    amount: i64,
    coin: Pubkey,
    gas: u64,
    currrencys: Vec<Currencys>,
) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let payments = &ctx.accounts.payments;
    let strategy_list = &ctx.accounts.strategy_list;

    let strategy = strategy_list
        .strategies
        .iter()
        .find(|s| s.token_address == strategy_token)
        .ok_or(ErrorCode::StrategyNotFound)?;

    // ✅ Verifica se está ativa
    require!(strategy.is_active, ErrorCode::StrategyNotFound);

    // 2. Verifica moedas ativadas
    for pair in currrencys.iter() {
        let from_valid = payments
            .coins
            .iter()
            .any(|c| c.pubkey == pair.from && c.coin.status);
        let to_valid = payments
            .coins
            .iter()
            .any(|c| c.pubkey == pair.to && c.coin.status);

        if !from_valid || !to_valid {
            return Err(ErrorCode::InvalidCoin.into());
        }
    }

    // 3. Chamada CPI → sub_account.position()
    let cpi_ctx_sub_accounts = CpiContext::new(
        ctx.accounts.sub_account_program.clone(),
        PositionLiquidity {
            bot: ctx.accounts.bot.clone(),
            user: ctx.accounts.user.clone(),
            sub_account: ctx.accounts.sub_account.clone(),
            strategy_balance: ctx.accounts.strategy_balance.clone(),
            signer: ctx.accounts.signer.clone(),
        },
    );

    let old_balance = _position_liquidity(
        cpi_ctx_sub_accounts,
        account_id.clone(),
        strategy_token,
        coin,
        amount,
    )?;

    // 4. Calcula a fee
    let fee = _calculate_fee(&payments, old_balance);

    let cpi_ctx_manager = CpiContext::new(
        ctx.accounts.manager_program.clone(),
        RebalancePosition {
            user: ctx.accounts.user.clone(),
            bot: ctx.accounts.bot.clone(),
            lp_token: ctx.accounts.lp_token.clone(),
            token_program: ctx.accounts.token_program.clone(),
            user_lp_token_account: ctx.accounts.user_lp_token_account.clone(),
            signer: ctx.accounts.signer.clone(),
            system_program: ctx.accounts.system_program.clone(),
        },
    );

    // 5. Chamada CPI → manager.rebalance_position()
    _rebalance_position(
        cpi_ctx_manager,
        amount,
        gas,
        coin,
        fee,
    )?;

    // 6. Emite eventos (Anchor Events ou logs)
    emit!(OpenPositionEvent {
        contract_address: ctx.accounts.bot.manager_address.key(),
        user: ctx.accounts.user.key(),
        id: account_id.clone(),
        strategy_token,
        coin,
        old_balance,
        fee,
        gas,
        profit: amount,
    });

    for pair in currrencys.iter() {
        emit!(TraderEvent {
            contract_address: ctx.accounts.bot.manager_address.key(),
            from: pair.from,
            to: pair.to,
        });
    }

    Ok(())
}