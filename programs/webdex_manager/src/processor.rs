use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_lang::solana_program::{program::invoke_signed, system_instruction};
use anchor_lang::system_program::{self};
use anchor_spl::token::{MintTo, Burn, Mint, mint_to, burn, transfer, Transfer};
use webdex_sub_accounts::{state::AddLiquidity, processor::_add_liquidity, program::WebdexSubAccounts};

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

pub fn _add_gas(ctx: Context<AddGas>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidAmount);

    let user = &mut ctx.accounts.user;

    // Atualiza o saldo de gas na conta do usuário
    user.gas_balance = user.gas_balance.saturating_add(amount);

    // 💸 Transfere o token do usuário para a vault (pode ser o próprio programa)
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_pol_account.to_account_info(),
        to: ctx.accounts.vault_pol_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    emit!(BalanceGasEvent {
        user: user.key(),
        balance: user.gas_balance,
        value: amount,
        increase: true,
        is_operation: false,
    });

    Ok(())
}

pub fn _remove_gas(ctx: Context<RemoveGas>, amount: u64) -> Result<()> {
    let user = &mut ctx.accounts.user;

    require!(user.gas_balance >= amount, ErrorCode::InsufficientGasBalance);

    user.gas_balance -= amount;

    // 💸 Transfere os tokens para o usuário
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_pol_account.to_account_info(),
        to: ctx.accounts.user_pol_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // Emite o evento
    emit!(BalanceGasEvent {
        user: user.key(),
        balance: user.gas_balance,
        value: amount,
        increase: false,
        is_operation: false,
    });

    Ok(())
}

pub fn _pass_add(ctx: Context<PassAdd>, amount: u64) -> Result<()> {
    require!(amount > 0, ErrorCode::InvalidAmount);

    let user = &mut ctx.accounts.user;

    // 🔁 Atualiza o saldo pass
    user.pass_balance = user.pass_balance.saturating_add(amount);

    // 💸 Transfere o token do usuário para a vault (pode ser o próprio programa)
    let cpi_accounts = Transfer {
        from: ctx.accounts.user_webdex_account.to_account_info(),
        to: ctx.accounts.vault_webdex_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // 🧾 Emite evento
    emit!(BalancePassEvent {
        user: user.key(),
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
        from: ctx.accounts.vault_webdex_account.to_account_info(),
        to: ctx.accounts.user_webdex_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(), // ou PDA se for vault do programa
    };
    let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
    transfer(cpi_ctx, amount)?;

    // 🧾 Emite evento
    emit!(BalancePassEvent {
        user: user.key(),
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
    _decimals: u8, // USADO NA STRUCT EM lp_token
    amount: u64,
) -> Result<()> {
    let strategy_list = &mut ctx.accounts.strategy_list;

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

   // 1. Transferência do token base do usuário → vault
    let transfer_accounts = Transfer {
        from: ctx.accounts.user_usdt_account.to_account_info(),
        to: ctx.accounts.vault_usdt_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(), // ✅ o dono da conta `from`
    };

    let cpi_transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );
    transfer(cpi_transfer_ctx, amount)?;

    // 2. Mint LP token para o usuário
    let bump = ctx.bumps.lp_mint_authority;

    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

    let cpi_mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.lp_token.to_account_info(),
            to: ctx.accounts.user_lp_token_account.to_account_info(),
            authority: ctx.accounts.lp_mint_authority.to_account_info(),
        },
        signer_seeds,
    );
    mint_to(cpi_mint_ctx, amount)?;

    Ok(())
}

pub fn _rebalance_position<'info>(
    mut ctx: CpiContext<'_, '_, '_, 'info, RebalancePosition<'info>>,
    _decimals: u8, // USADO NA STRUCT EM lp_token
    amount: u64,
    gas: u64,
    fee: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let signer = &mut ctx.accounts.signer;

    if ctx.accounts.bot.payments_address != signer.key() {
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

    let (expected, bump) = Pubkey::find_program_address(
        &[b"mint_authority"],
        &crate::ID, // <- ou PROGRAM_ID importado de crate
    );
    require!(
        ctx.accounts.lp_mint_authority.key() == expected,
        ErrorCode::InvalidAuthority
    );
    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority", &[bump]]];

    if amount > 0 {
        // Mint
        let cpi_mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lp_token.to_account_info(),
                to: ctx.accounts.user_lp_token_account.to_account_info(),
                authority: ctx.accounts.lp_mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_mint_ctx, amount)?;
    } else {
        // Burn
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lp_token.to_account_info(),
                from: ctx.accounts.user_lp_token_account.to_account_info(),
                authority: ctx.accounts.lp_mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        burn(cpi_ctx, amount)?;
    }

    let signer_clone = &ctx.accounts.signer.key();
    let owner_clone = &ctx.accounts.bot.owner;

    // Transfera gas para o owner do bot
    let transfer_instruction = system_instruction::transfer(signer_clone, owner_clone, gas);

    // Invoke the transfer instruction
    invoke_signed(
        &transfer_instruction,
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.bot_owner.clone(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[],
    )?;

    // Emite eventos (você pode adaptar para seus eventos atuais)
    emit!(BalanceGasEvent {
        user: user.key(),
        balance: user.gas_balance,
        value: gas,
        increase: false,
        is_operation: true,
    });

    emit!(BalancePassEvent {
        user: user.key(),
        balance: user.pass_balance,
        value: fee,
        increase: false,
        is_operation: true,
    });

    Ok(())
}