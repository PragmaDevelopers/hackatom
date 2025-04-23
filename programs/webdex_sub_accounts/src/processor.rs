use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_spl::token::{Transfer, Burn, transfer, burn};

use shared_sub_accounts::state::{BalanceStrategy};

pub fn _create_sub_account(ctx: Context<CreateSubAccount>, name: String) -> Result<()> {
    let sub_account_list = &mut ctx.accounts.sub_account_list;
    let sub_account = &mut ctx.accounts.sub_account;
    let signer = &ctx.accounts.signer;
    let user = &ctx.accounts.user;

    if ctx.accounts.bot.manager_address == Pubkey::default() {
       return Err(ErrorCode::Unauthorized.into());
    }

    // ✅ Garante que o contrato da lista pertence ao mesmo bot
    if sub_account_list.contract_address == Pubkey::default() {
        sub_account_list.contract_address = signer.key();
    }

    let sub_account_count = sub_account_list.sub_accounts.len();

    // ✅ Converte para u8 com verificação segura
    let index_byte = u8::try_from(sub_account_count)
        .map_err(|_| ErrorCode::MaxSubAccountsReached)?;

    // ✅ Gera o PDA de forma determinística
    let (sub_account_id, _bump) = Pubkey::find_program_address(
        &[
            b"sub_account_id",
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
        signer: signer.key(),
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
    account_id: String,
) -> Result<i64> {
    let list = &ctx.accounts.sub_account_list;

    for (i, entry) in list.sub_accounts.iter().enumerate() {
        if entry.id == account_id {
            return Ok(i as i64);
        }
    }

    Ok(-1)
}

pub fn _add_liquidity<'info>(
    ctx: Context<AddLiquidity>,
    strategy_token: Pubkey,
    account_id: String,
    coin: Pubkey,
    amount: u64,
    name: String,
    ico: String,
    decimals: u8,
) -> Result<()> {
    let sub_account = &mut ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;
    let signer = &ctx.accounts.signer;

    // Verificação de permissão
    if ctx.accounts.bot.manager_address == Pubkey::default() {
       return Err(ErrorCode::Unauthorized.into());
    }

    // Confirma subconta correta
    if sub_account.id != account_id {
        return Err(ErrorCode::InvalidSubAccountId.into());
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
    emit!(BalanceLiquidityEvent {
        signer: signer.key(),
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

pub fn _toggle_pause(
    ctx: Context<TogglePause>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    paused: bool,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;

    if ctx.accounts.bot.manager_address == Pubkey::default() {
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
        signer: ctx.accounts.signer.key(),
        user: ctx.accounts.user.key(),
        id: account_id,
        strategy_token,
        coin,
        paused,
    });

    Ok(())
}

pub fn _remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: u64,
    _sub_account_name: String,
) -> Result<()> {
    let sub_account = &ctx.accounts.sub_account;
    let strat_balance = &mut ctx.accounts.strategy_balance;
    let signer = &ctx.accounts.signer;
    let token_program = &ctx.accounts.token_program;
    let user = ctx.accounts.user.key();
    let bot = ctx.accounts.bot.key();

    if ctx.accounts.bot.manager_address == Pubkey::default() {
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

    // ✅ Queima os tokens LP do usuário
    let burn_accounts = Burn {
        mint: ctx.accounts.lp_token.to_account_info(),
        from: ctx.accounts.user_lp_token_account.to_account_info(),
        authority: signer.to_account_info(),
    };
    let cpi_burn_ctx = CpiContext::new(token_program.to_account_info(), burn_accounts);
    burn(cpi_burn_ctx, amount)?;

    // ✅ Transfere o token original da vault para o usuário
    let transfer_accounts = Transfer {
        from: ctx.accounts.vault_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.sub_account.to_account_info(), // vault authority
    };

    let vault_bump = ctx.bumps.sub_account;
    let vault_seeds: &[&[u8]] = &[
        b"sub_account",
        bot.as_ref(),
        user.as_ref(),
        sub_account.name.as_bytes(),
        &[vault_bump],
    ];
    let signer_seeds: &[&[&[u8]]] = &[vault_seeds];

    let cpi_transfer_ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );
    transfer(cpi_transfer_ctx, amount)?;

    // ✅ Emite evento de saída
    emit!(BalanceLiquidityEvent {
        signer: signer.key(),
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

pub fn _position_liquidity<'info>(
    mut ctx: CpiContext<'_, '_, '_, 'info, PositionLiquidity<'info>>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
    amount: i64, // pode ser positivo ou negativo
) -> Result<u64> {
    let sub_account = &ctx.accounts.sub_account;

    if ctx.accounts.bot.manager_address == Pubkey::default() {
       return Err(ErrorCode::Unauthorized.into());
    }

    if ctx.accounts.bot.payments_address == Pubkey::default() {
       return Err(ErrorCode::YouMustTheWebDexPayments.into());
    }

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
        signer: ctx.accounts.signer.key(),
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