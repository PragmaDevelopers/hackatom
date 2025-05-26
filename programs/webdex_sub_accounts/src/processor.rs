use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

use shared_sub_accounts::state::{BalanceStrategy};
use webdex_payments::state::{Payments};

pub fn _create_sub_account(
    ctx: Context<CreateSubAccount>,
    name: String,
) -> Result<()> {
    let user_key = ctx.accounts.user.key();
    let bot = &ctx.accounts.bot;
    let sub_account = &mut ctx.accounts.sub_account;
    let tracker = &mut ctx.accounts.tracker;

    // Valida limite de subcontas
    if tracker.count >= UserSubAccountTracker::MAX_SUBACCOUNTS as u8 {
        return Err(ErrorCode::MaxSubAccountsReached.into());
    }

    // Valida nome duplicado
    if tracker.names.iter().any(|n| n == &name) {
        return Err(ErrorCode::DuplicateSubAccountName.into());
    }

    // Gera id determinístico (opcional, pode usar o próprio address)
    let (sub_account_id, _bump) = Pubkey::find_program_address(
        &[
            b"sub_account_id",
            user_key.as_ref(),
            name.as_bytes(),
            bot.prefix.as_ref(),
        ],
        ctx.program_id,
    );

    // Inicializa subconta
    sub_account.user = user_key;
    sub_account.bot = bot.key();
    sub_account.id = sub_account_id;
    sub_account.name = name.clone();

    // Atualiza o tracker
    tracker.count += 1;
    tracker.names.push(name.clone());

    // Evento
    emit!(CreateSubAccountEvent {
        user: user_key,
        id: sub_account_id,
        name,
    });

    Ok(())
}

pub fn _add_liquidity<'info>(
    ctx: Context<AddLiquidity>,
    account_name: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: u64,
    name: String,
    ico: String,
    decimals: u8,
) -> Result<()> {
    let sub_account = &mut ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    // Confirma subconta correta
    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    // Vincula strategy_token se ainda não existe
    if !sub_account.list_strategies.contains(&strategy_token) {
        sub_account.list_strategies.push(strategy_token);
        sub_account.strategies.push(strat_balance.key());
    }

    // Atualiza ou adiciona novo balance
    let coin_index = strat_balance
        .list_coins
        .iter()
        .position(|c| *c == coin);

    if let Some(idx) = coin_index {
        strat_balance.balance[idx].amount = strat_balance.balance[idx]
            .amount
            .saturating_add(amount);
    } else {
        strat_balance.strategy_token = strategy_token;
        strat_balance.status = true;
        strat_balance.list_coins.push(coin);
        strat_balance.balance.push(BalanceStrategy {
            amount,
            token: coin,
            decimals,
            ico,
            name,
            status: true,
            paused: false,
        });
    }

    // Emite evento
    emit!(AddAndRemoveLiquidityEvent {
        account_name,
        strategy_token,
        coin,
        amount,
        increase: true,
        is_operation: false,
    });

    Ok(())
}

pub fn _get_balance(
    ctx: Context<GetBalance>,
    account_name: String,
    strategy_token: Pubkey,
    coin: Pubkey,
) -> Result<BalanceStrategy> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &ctx.accounts.strategy_balance;
    
    // ✅ Verifica se o SubAccount pertence ao contrato
    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    // ✅ Verifica se a strategy está registrada
    if !sub_account.list_strategies.contains(&strategy_token) {
        return Err(ErrorCode::StrategyNotLinked.into());
    }

    // ✅ Confirma que strategy_token é o correto
    if strat_balance.strategy_token != strategy_token || !strat_balance.status {
        return Err(ErrorCode::StrategyNotLinked.into());
    }

    // ✅ Busca coin dentro do strategy balance
    let coin_index = strat_balance
        .list_coins
        .iter()
        .position(|c| *c == coin)
        .ok_or(ErrorCode::CoinNotLinked)?;

    let balance = strat_balance.balance[coin_index].clone();

    Ok(balance)
}

pub fn _get_balances(
    ctx: Context<GetBalances>,
    account_name: String,
    strategy_token: Pubkey,
) -> Result<Vec<BalanceStrategy>> {
    let sub_account = &ctx.accounts.sub_account;
    let strategy_balance = &ctx.accounts.strategy_balance;

    // Verifica ID da subconta
    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    // Verifica se a subconta está vinculada à estratégia
    if !sub_account.list_strategies.contains(&strategy_token) {
        return Err(ErrorCode::StrategyNotLinked.into());
    }

    // Retorna todos os balances
    Ok(strategy_balance.balance.clone())
}

pub fn _get_sub_account_strategies(
    ctx: Context<GetSubAccountStrategies>,
    account_name: String,
) -> Result<Vec<Pubkey>> {
    let sub_account = &ctx.accounts.sub_account;

    // ✅ Verifica se o ID da subconta bate com o informado
    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    // ✅ Retorna a lista de estratégias vinculadas
    Ok(sub_account.list_strategies.clone())
}

pub fn _toggle_pause(
    ctx: Context<TogglePause>,
    account_name: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    paused: bool,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    let coin_index = strat_balance
        .balance
        .iter()
        .position(|b| b.token == coin);

    let idx = coin_index.ok_or(ErrorCode::CoinNotFound)?;

    let balance_entry = &mut strat_balance.balance[idx];

    if !balance_entry.status {
        return Err(ErrorCode::CoinNotLinkedToStrategy.into());
    }

    if balance_entry.paused == paused {
        return Err(ErrorCode::PauseStateUnchanged.into());
    }

    balance_entry.paused = paused;

    emit!(ChangePausedEvent {
        signer: ctx.accounts.signer.key(),
        user: ctx.accounts.user.key(),
        account_name,
        strategy_token,
        coin,
        paused,
    });

    Ok(())
}

pub fn _remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    account_name: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: u64,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    // ✅ Confirma subconta correta
    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

    // ✅ Confirma que a moeda existe na lista
    let coin_index = strat_balance
        .balance
        .iter()
        .position(|b| b.token == coin)
        .ok_or(ErrorCode::CoinNotFound)?;

    let balance_entry = &mut strat_balance.balance[coin_index];

    // ✅ Confirma que está pausado
    if !balance_entry.paused {
        return Err(ErrorCode::MustPauseBeforeWithdraw.into());
    }

    // ✅ Confirma saldo suficiente
    if balance_entry.amount < amount {
        return Err(ErrorCode::InsufficientFunds.into());
    }

    // ✅ Atualiza o saldo
    balance_entry.amount = balance_entry.amount.saturating_sub(amount);

    // ✅ Emite evento de saída
    emit!(AddAndRemoveLiquidityEvent {
        account_name,
        strategy_token,
        coin,
        amount,
        increase: false,
        is_operation: false,
    });

    Ok(())
}

pub fn _position_liquidity(
    ctx: Context<PositionLiquidity>,
    account_name: String,
    strategy_token: Pubkey,
    amount: i64,
    coin: Pubkey,
    gas: u64,
    currrencys: Vec<Currencys>,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let signer = &ctx.accounts.signer;
    let payments = &ctx.accounts.payments;
    let user = &ctx.accounts.user;
    let strategy_list = &ctx.accounts.strategy_list;
    let temporary_rebalance = &mut ctx.accounts.temporary_rebalance;

    if ctx.accounts.bot.manager_address == Pubkey::default() {
       return Err(ErrorCode::Unauthorized.into());
    }

    if ctx.accounts.bot.owner != signer.key() {
       return Err(ErrorCode::YouMustTheWebDexPayments.into());
    }

    if sub_account.name != account_name {
        return Err(ErrorCode::InvalidSubAccountName.into());
    }

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

    let strat_balance = &mut ctx.accounts.strategy_balance;

    let idx = strat_balance
        .balance
        .iter()
        .position(|b| b.token == coin)
        .ok_or(ErrorCode::CoinNotFound)?;

    let entry = &mut strat_balance.balance[idx];

    if !entry.status {
        return Err(ErrorCode::CoinNotLinkedToStrategy.into());
    }

    let old_balance = entry.amount;

    // 4. Calcula a fee
    let fee = _calculate_fee(&payments, old_balance);

    // ✅ Aplica a operação
    let new_balance = if amount >= 0 {
        entry.amount.saturating_add(amount as u64)
    } else {
        let sub_amount = amount.abs() as u64;
        if entry.amount < sub_amount {
            return Err(ErrorCode::InsufficientFunds.into());
        }
        entry.amount.saturating_sub(sub_amount)
    };

    entry.amount = new_balance;

    // Armazena a fee no PDA temporário
    temporary_rebalance.fee = fee;

    // CHAMAR A FUNÇÂO REBALANCE POSITION DO CONTRATO MANAGER LOGO DEPOIS PARA FAZER USO DO "temp_fee_account"

    emit!(BalanceLiquidityEvent {
        account_name: account_name.clone(),
        strategy_token,
        coin,
        amount: amount,
        increase: amount >= 0,
        is_operation: true,
    });

    let details = PositionDetails {
        strategy: strategy_token,
        coin,
        old_balance,
        fee,
        gas,
        profit: amount,
    };

    // 5. Emite eventos (Anchor Events ou logs)
    emit!(OpenPositionEvent {
        contract_address: ctx.accounts.bot.manager_address.key(),
        user: ctx.accounts.user.key(),
        account_name: account_name.clone(),
        details,
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