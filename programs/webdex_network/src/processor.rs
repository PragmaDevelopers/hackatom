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

    require!(
        balance_info.balance >= amount,
        ErrorCode::InsufficientBalance
    );

    let fee = amount
        .checked_mul(bot.fee_withdraw_network)
        .unwrap()
        .checked_div(100)
        .unwrap();

    let amount_after_fee = amount.checked_sub(fee).unwrap();

    balance_info.balance = balance_info.balance.checked_sub(amount).unwrap();

    // Transfere para usuário
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_network_account.to_account_info(),
            to: ctx.accounts.user_network_account.to_account_info(), // assume que signer é dono do ATA
            authority: ctx.accounts.fee_collector_network_address.to_account_info(),
        },
    );
    transfer(cpi_ctx, amount_after_fee)?;

    // Transfere fee para fee_collector
    let cpi_ctx_fee = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_network_account.to_account_info(),
            to: ctx.accounts.fee_collector_network_account.to_account_info(),
            authority: ctx.accounts.fee_collector_network_address.to_account_info(),
        },
    );
    transfer(cpi_ctx_fee, fee)?;

    emit!(BalanceNetworkRemove {
        contract_address: balance_info.contract_address,
        user: balance_info.user,
        token: balance_info.token,
        new_balance: balance_info.balance,
        amount,
        fee,
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