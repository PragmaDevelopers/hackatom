use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_lang::solana_program::{program::invoke, system_instruction};
use anchor_spl::token::{MintTo, Burn, Mint, mint_to, burn,transfer,Transfer};

pub fn _register_manager(ctx: Context<RegisterManager>, manager: Pubkey) -> Result<()> {
    let user = &mut ctx.accounts.user;

    user.manager = manager;
    user.gas_balance = 0;
    user.pass_balance = 0;
    user.status = true;

    emit!(RegisterEvent {
        user: user.key(),
        manager,
    });

    Ok(())
}

pub fn _register(ctx: Context<Register>, manager: Pubkey) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let manager = &mut ctx.accounts.manager;

    if manager.key() != Pubkey::default() {
        if !manager.status {
            return Err(ErrorCode::UnregisteredManager.into());
        }
    }

    if user.status {
        return Err(ErrorCode::UnregisteredUser.into());
    }

    user.manager = manager.key();
    user.gas_balance = 0;
    user.pass_balance = 0;
    user.status = true;

    emit!(RegisterEvent {
        user: user.key(),
        manager: manager.key(),
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
    let vault_account = &ctx.accounts.vault_account;

    require!(user.gas_balance >= amount, ErrorCode::InsufficientGasBalance);

    user.gas_balance -= amount;

    // Cria a instrução de transferência da SystemProgram
    let ix = system_instruction::transfer(
        &vault_account.key(),       // De quem vai sair o SOL
        &signer.key(),         // Para quem vai
        amount,                // Quanto
    );

    // Executa a CPI com as contas envolvidas
    invoke(
        &ix,
        &[
            vault_account.to_account_info(),
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

    // Executa a transferência de SOL para a vault_account
    let ix = system_instruction::transfer(
        &ctx.accounts.signer.key(),
        &ctx.accounts.vault_account.key(),
        amount,
    );

    invoke(
        &ix,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.vault_account.to_account_info(),
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
        to: ctx.accounts.vault_account.to_account_info(),
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
        to: ctx.accounts.vault_account.to_account_info(),
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

pub fn _liquidity_add(
    ctx: Context<LiquidityAdd>,
    strategy_token: Pubkey,
    _decimals: u8,
    amount: u64,
) -> Result<()> {
    let strategy_list = &mut ctx.accounts.strategy_list;
    let signer = &ctx.accounts.signer;
    let token_program = &ctx.accounts.token_program;
    let vault_account = &ctx.accounts.vault_account;

    let strategy_opt = strategy_list
        .strategies
        .iter()
        .find(|s| s.token_address == strategy_token);

    match strategy_opt {
        Some(strategy) => {
            require!(strategy.is_active, ErrorCode::StrategyNotFound);
        },
        None => {
            return Err(ErrorCode::StrategyNotFound.into());
        }
    }

    // Transferência de token do usuário para a vault (subconta)
    let transfer_accounts = Transfer {
        from: ctx.accounts.signer.to_account_info(),
        to: vault_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_transfer_ctx = CpiContext::new(token_program.to_account_info(), transfer_accounts);
    transfer(cpi_transfer_ctx, amount)?;

    // Mint dos tokens LP para o usuário
    let mint_to_accounts = MintTo {
        mint: ctx.accounts.lp_token.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_mint_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), mint_to_accounts);
    mint_to(cpi_mint_ctx, amount)?;

    Ok(())
}

pub fn _rebalance_position<'info>(
    mut ctx: CpiContext<'_, '_, '_, 'info, RebalancePosition<'info>>,
    amount: i64,
    gas: u64,
    coin: Pubkey,
    fee: u64,
    bump: u8,
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