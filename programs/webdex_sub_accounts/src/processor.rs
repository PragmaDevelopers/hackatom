use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

use shared_sub_accounts::state::*;

pub fn _create_sub_account(ctx: Context<CreateSubAccount>, name: String) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let sub_account_list = &mut ctx.accounts.sub_account_list;
    let sub_account = &mut ctx.accounts.sub_account;
    let owner = &ctx.accounts.owner;
    let user = &ctx.accounts.user;

    if bot.contract_address != ctx.accounts.contract_address.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // ✅ Garante que o contrato da lista pertence ao mesmo bot
    if sub_account_list.contract_address == Pubkey::default() {
        sub_account_list.contract_address = bot.contract_address;
    } else if sub_account_list.contract_address != bot.contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // ✅ Limite máximo de subcontas
    let sub_account_count = sub_account_list.sub_accounts.len();
    if sub_account_count >= 50 {
        return Err(ErrorCode::MaxSubAccountsReached.into());
    }

    // ✅ Converte para u8 com verificação segura
    let index_byte = u8::try_from(sub_account_count)
        .map_err(|_| ErrorCode::MaxSubAccountsReached)?;

    // ✅ Gera o PDA de forma determinística
    let (sub_account_id, _bump) = Pubkey::find_program_address(
        &[
            b"sub_account_id",
            bot.key().as_ref(),
            user.key().as_ref(),
            name.as_bytes(),
            &[index_byte],
        ],
        ctx.program_id,
    );

    // ✅ Inicializa a subconta
    sub_account.id = sub_account_id.to_string();
    sub_account.name = name.clone();
    sub_account.list_strategies = Vec::new();
    sub_account.strategies = Vec::new();

    // ✅ Atualiza a lista de subcontas
    sub_account_list.sub_accounts.push(SimpleSubAccount {
        sub_account_address: sub_account.key(),
        id: sub_account_id.to_string(),
        name: name.clone(),
    });

    // ✅ Emite o evento
    emit!(CreateSubAccountEvent {
        owner: owner.key(),
        user: user.key(),
        id: sub_account_id.to_string(),
        name,
    });

    Ok(())
}

pub fn _get_sub_accounts(
    ctx: Context<GetSubAccounts>,
    contract_address: Pubkey,
) -> Result<Vec<SimpleSubAccount>> {
    let list = &ctx.accounts.sub_account_list;

    // ✅ Validação de segurança
    if list.contract_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // ✅ Converte de SubAccountEntry para SimpleSubAccount (mais leve)
    let sub_accounts = list
        .sub_accounts
        .iter()
        .map(|entry| SimpleSubAccount {
            sub_account_address: entry.sub_account_address.clone(),
            id: entry.id.clone(),
            name: entry.name.clone(),
        })
        .collect();

    Ok(sub_accounts)
}

pub fn _find_sub_account_index_by_id(
    ctx: Context<FindSubAccountIndex>,
    contract_address: Pubkey,
    account_id: String,
) -> Result<i64> {
    let list = &ctx.accounts.sub_account_list;

    // ✅ Validação de segurança
    if list.contract_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    for (i, entry) in list.sub_accounts.iter().enumerate() {
        if entry.id == account_id {
            return Ok(i as i64);
        }
    }

    Ok(-1)
}

pub fn _add_liquidity(
    ctx: Context<AddLiquidity>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: u64,
    name: String,
    ico: String,
    decimals: u8,
) -> Result<()> {
    let sub_account = &mut ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    if ctx.accounts.bot.contract_address != ctx.accounts.contract_address.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // ✅ Confirma subconta correta
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
    }

    // ✅ Vincula strategy_token se ainda não existe
    if !sub_account.list_strategies.contains(&strategy_token) {
        sub_account.list_strategies.push(strategy_token);
        sub_account.strategies.push(strat_balance.key());
    }

    // ✅ Verifica se a moeda já está na lista
    let coin_index = strat_balance
        .list_coins
        .iter()
        .position(|c| *c == coin);

    if let Some(idx) = coin_index {
        // Coin já existe, incrementa amount
        strat_balance.balance[idx].amount = strat_balance.balance[idx]
            .amount
            .saturating_add(amount);
    } else {
        // Nova moeda e novo balance
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

    // ✅ Emite o evento
    emit!(BalanceLiquidityEvent {
        owner: ctx.accounts.owner.key(),
        user: ctx.accounts.user.key(),
        id: account_id,
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
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
) -> Result<BalanceStrategy> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &ctx.accounts.strategy_balance;
    
    // ✅ Verifica se o SubAccount pertence ao contrato
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
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
    account_id: String,
    strategy_token: Pubkey,
) -> Result<Vec<BalanceStrategy>> {
    let sub_account = &ctx.accounts.sub_account;
    let strategy_balance = &ctx.accounts.strategy_balance;

    // Verifica ID da subconta
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
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
    account_id: String,
) -> Result<Vec<Pubkey>> {
    let sub_account = &ctx.accounts.sub_account;

    // ✅ Verifica se o ID da subconta bate com o informado
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
    }

    // ✅ Retorna a lista de estratégias vinculadas
    Ok(sub_account.list_strategies.clone())
}

pub fn _remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: u64,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    if ctx.accounts.bot.contract_address != ctx.accounts.contract_address.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // ✅ Confirma subconta correta
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
    }

    // ✅ Confirma que a moeda existe na lista
    let coin_index = strat_balance
        .balance
        .iter()
        .position(|b| b.token == coin);

    let idx = coin_index.ok_or(ErrorCode::CoinNotFound)?;

    let balance_entry = &mut strat_balance.balance[idx];

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
    emit!(BalanceLiquidityEvent {
        owner: ctx.accounts.owner.key(),
        user: ctx.accounts.user.key(),
        id: account_id,
        strategy_token,
        coin,
        amount,
        increase: false,
        is_operation: false,
    });

    Ok(())
}

pub fn _toggle_pause(
    ctx: Context<TogglePause>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    paused: bool,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    if ctx.accounts.bot.contract_address != ctx.accounts.contract_address.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
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
        owner: ctx.accounts.owner.key(),
        user: ctx.accounts.user.key(),
        id: account_id,
        strategy_token,
        coin,
        paused,
    });

    Ok(())
}

pub fn _position_liquidity(
    ctx: Context<PositionLiquidity>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: i64, // pode ser positivo ou negativo
) -> Result<u64> {
    // ✅ Garante que quem chamou foi o programa de pagamentos
    if ctx.accounts.payments.key() == ctx.accounts.bot.payments_address {
        return Err(ErrorCode::UnauthorizedPaymentsCaller.into());
    }

    let sub_account = &ctx.accounts.sub_account;
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
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

    // ✅ Aplica a operação
    let new_balance = if amount >= 0 {
        entry.amount.saturating_add(amount as u64)
    } else {
        let sub = amount.unsigned_abs();
        if entry.amount < sub {
            return Err(ErrorCode::InsufficientFunds.into());
        }
        entry.amount.saturating_sub(sub)
    };

    entry.amount = new_balance;

    emit!(BalanceLiquidityEvent {
        owner: ctx.accounts.owner.key(),
        user: ctx.accounts.user.key(),
        id: account_id,
        strategy_token,
        coin,
        amount: amount.unsigned_abs(),
        increase: amount >= 0,
        is_operation: true,
    });

    Ok(old_balance)
}