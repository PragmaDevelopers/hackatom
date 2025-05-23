use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_spl::token::{transfer, Transfer};

pub fn _pay_fee(
    ctx: Context<PayFee>,
    contract_address: Pubkey,
    amount: u64,
) -> Result<()> {
    let signer = &mut ctx.accounts.signer;

    if ctx.accounts.bot.owner != signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    let balance_info = &mut ctx.accounts.balance_info;

    // Se ainda não estava inicializado
    if balance_info.token == Pubkey::default() {
        balance_info.token = ctx.accounts.token_mint.key();
        balance_info.user = ctx.accounts.user.key();
        balance_info.contract_address = contract_address;
    }

    balance_info.balance = balance_info
        .balance
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;

    emit!(BalanceNetworkAdd {
        contract_address: contract_address,
        user: ctx.accounts.user.key(),
        token: ctx.accounts.token_mint.key(),
        new_balance: balance_info.balance,
        amount
    });

    Ok(())
}

pub fn _withdrawal(ctx: Context<Withdrawal>, amount: u64) -> Result<()> {
    let balance_info = &mut ctx.accounts.balance_info;
    let bot = &ctx.accounts.bot;

    // Verifica saldo suficiente
    require!(
        balance_info.balance >= amount,
        ErrorCode::InsufficientBalance
    );

    // Atualiza o saldo lógico
    balance_info.balance = balance_info.balance.checked_sub(amount).unwrap();

    // Cálculo de taxas
    let total_fee_percent = bot.fee_withdraw_network + bot.fee_withdraw_void;
    require!(total_fee_percent <= 100, ErrorCode::InvalidFeePercent);

    let user_percent = 100u64.checked_sub(total_fee_percent).unwrap();

    let user_share = amount.checked_mul(user_percent).unwrap().checked_div(100).unwrap();
    let network_fee = amount.checked_mul(bot.fee_withdraw_network).unwrap().checked_div(100).unwrap();
    let total_void_fee = amount.checked_mul(bot.fee_withdraw_void).unwrap().checked_div(100).unwrap();
    let collector_amount = total_void_fee.checked_div(4).unwrap(); // 4 collectors

    // --- Transferência para o usuário
    let cpi_ctx_user = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.sub_account_authority.to_account_info(),
        },
    );
    transfer(cpi_ctx_user, user_share)?;

    // --- Transferência para fee_collector_network
    let cpi_ctx_fee = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.fee_collector_network_account.to_account_info(),
            authority: ctx.accounts.sub_account_authority.to_account_info(),
        },
    );
    transfer(cpi_ctx_fee, network_fee)?;

    // --- Transferência para os 4 void collectors
    let collector_accounts = [
        &ctx.accounts.void_collector_1_lp_account,
        &ctx.accounts.void_collector_2_lp_account,
        &ctx.accounts.void_collector_3_lp_account,
        &ctx.accounts.void_collector_4_lp_account,
    ];

    for collector_account in collector_accounts.iter() {
        let cpi_ctx_collector = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: collector_account.to_account_info(),
                authority: ctx.accounts.sub_account_authority.to_account_info(),
            },
        );
        transfer(cpi_ctx_collector, collector_amount)?;
    }

    // --- Evento
    emit!(BalanceNetworkRemove {
        contract_address: balance_info.contract_address,
        user: balance_info.user,
        token: balance_info.token,
        new_balance: balance_info.balance,
        amount,
        fee: network_fee + total_void_fee,
    });

    Ok(())
}

pub fn _get_balance(
    ctx: Context<GetBalance>,
) -> Result<BalanceData> {
    let balance_info = &mut ctx.accounts.balance_info;
    Ok(BalanceData {
        balance: balance_info.balance,
    })
}