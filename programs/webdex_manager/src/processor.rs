use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_spl::token::{MintTo, Burn, Mint, mint_to, burn,transfer,Transfer};

pub fn _register(ctx: Context<Register>, manager: Pubkey) -> Result<()> {
    let user = &mut ctx.accounts.user;

    if manager != Pubkey::default() {
        if !user.status {
            return Err(ErrorCode::UnregisteredManager.into());
        }
    }

    user.manager = manager;
    user.gas_balance = 0;
    user.pass_balance = 0;
    user.status = true;

    emit!(RegisterEvent {
        user: ctx.accounts.signer.key(),
        manager,
    });

    Ok(())
}

pub fn _get_info_user(ctx: Context<GetInfoUser>) -> Result<UserDisplay> {
    let user = &ctx.accounts.user;

    let display = UserDisplay {
        manager: user.manager,
        gas_balance: user.gas_balance,
        pass_balance: user.pass_balance,
    };

    Ok(display)
}

pub fn _remove_gas(ctx: Context<RemoveGas>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let signer = &ctx.accounts.signer;
    let treasury = &ctx.accounts.treasury;

    require!(user.gas_balance >= amount, ErrorCode::InsufficientGasBalance);

    user.gas_balance -= amount;

    // Cria a instrução de transferência da SystemProgram
    let ix = system_instruction::transfer(
        &treasury.key(),       // De quem vai sair o SOL
        &signer.key(),         // Para quem vai
        amount,                // Quanto
    );

    // Executa a CPI com as contas envolvidas
    invoke(
        &ix,
        &[
            treasury.to_account_info(),
            signer.to_account_info(),
        ],
    )?;

    // Emite o evento
    emit!(BalanceGasEvent {
        user: signer.key(),
        balance: user.gas_balance,
        value: amount,
        increase: false,
        is_operation: false,
    });

    Ok(())
}

pub fn _add_gas(ctx: Context<AddGas>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidAmount);

    // Executa a transferência de SOL para a treasury
    let ix = system_instruction::transfer(
        &ctx.accounts.signer.key(),
        &ctx.accounts.treasury.key(),
        amount,
    );

    invoke(
        &ix,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;

    // Atualiza o saldo de gas na conta do usuário
    let user = &mut ctx.accounts.user;
    user.gas_balance = user.gas_balance.saturating_add(amount);

    emit!(BalanceGasEvent {
        user: ctx.accounts.signer.key(),
        balance: user.gas_balance,
        value: amount,
        increase: true,
        is_operation: false,
    });

    Ok(())
}

pub fn _pass_add(ctx: Context<PassAdd>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user;

    // 🔁 Atualiza o saldo pass
    user.pass_balance = user.pass_balance.saturating_add(amount);

    // 💸 Transfere o token do usuário para a vault (pode ser o próprio programa)
    let cpi_accounts = Transfer {
        from: ctx.accounts.signer.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // 🧾 Emite evento
    emit!(BalancePassEvent {
        user: ctx.accounts.signer.key(),
        balance: user.pass_balance,
        value: amount,
        increase: true,
        is_operation: false,
    });

    Ok(())
}


pub fn _pass_remove(ctx: Context<PassRemove>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user;

    // ✅ Verifica saldo
    if user.pass_balance < amount {
        return Err(error!(ErrorCode::InsufficientPassBalance));
    }

    // 🔁 Atualiza saldo
    user.pass_balance = user.pass_balance.saturating_sub(amount);

    // 💸 Transfere os tokens para o usuário
    let cpi_accounts = Transfer {
         from: ctx.accounts.signer.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(), // ou PDA se for vault do programa
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // 🧾 Emite evento
    emit!(BalancePassEvent {
        user: ctx.accounts.signer.key(),
        balance: user.pass_balance,
        value: amount,
        increase: false,
        is_operation: false,
    });

    Ok(())
}

pub fn _rebalance_position(
    ctx: Context<RebalancePosition>,
    amount: i64,
    gas: u64,
    coin: Pubkey,
    fee: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;

    if ctx.accounts.bot.payments_address != ctx.accounts.signer.key() {
       return Err(ErrorCode::YouMustTheWebDexPayments.into());
    }

    // ⚠️ Valida saldo suficiente
    if user.gas_balance < gas {
        return Err(ErrorCode::InsufficientGasBalance.into());
    }
    if user.pass_balance < fee {
        return Err(ErrorCode::InsufficientPassBalance.into());
    }

    // Atualiza saldos
    user.gas_balance = user.gas_balance.saturating_sub(gas);
    user.pass_balance = user.pass_balance.saturating_sub(fee);

    // Mint ou Burn LP Tokens
    let token_program = &ctx.accounts.token_program;

    let bump = ctx.bumps.mint_authority;
    let seeds: &[&[u8]] = &[b"mint_authority", &[bump]];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    if amount > 0 {
        // Mint
        let cpi_ctx = CpiContext::new_with_signer(
            token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lp_token.to_account_info(),
                to: ctx.accounts.user_lp_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_ctx, amount as u64)?;
    } else {
        // Burn
        let cpi_ctx = CpiContext::new_with_signer(
            token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lp_token.to_account_info(),
                from: ctx.accounts.user_lp_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
            &[],
        );
        burn(cpi_ctx, (-amount) as u64)?;
    }

    // Transfera gas para o owner do bot
    let ix = anchor_lang::solana_program::system_instruction::transfer(
        &ctx.accounts.signer.key(),
        &ctx.accounts.bot.owner,
        gas,
    );
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.bot.to_account_info(),
        ],
    )?;

    // Emite eventos (você pode adaptar para seus eventos atuais)
    emit!(BalanceGasEvent {
        user: ctx.accounts.signer.key(),
        balance: user.gas_balance,
        value: gas,
        increase: false,
        is_operation: true,
    });

    emit!(BalancePassEvent {
        user: ctx.accounts.signer.key(),
        balance: user.pass_balance,
        value: fee,
        increase: false,
        is_operation: true,
    });

    Ok(())
}