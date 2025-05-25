use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_lang::solana_program::{
    program::{invoke,invoke_signed},
    system_instruction,
};
use anchor_spl::token::{MintTo, Burn, mint_to, burn, transfer, Transfer};

pub fn _register(ctx: Context<Register>) -> Result<()> {
    let user = &mut ctx.accounts.user;

    // Proteção: evitar sobrescrever dados se o user já estiver registrado
    if user.status {
        return Err(ErrorCode::RegisteredUser.into());
    }

    // Lógica de manager opcional
    match &ctx.accounts.manager {
        Some(manager) => {
            if !manager.status {
                return Err(ErrorCode::UnregisteredManager.into());
            }
            user.manager = manager.key();
        }
        None => {
            user.manager = Pubkey::default();
        }
    }

    user.gas_balance = 0;
    user.pass_balance = 0;
    user.status = true;

    emit!(RegisterEvent {
        user: user.key(),
        manager: user.manager,
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

    // Transfere lamports do usuário (signer) para a conta PDA (vault_wsol_account)
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.signer.key(),
            &ctx.accounts.vault_wsol_account.key(),
            amount,
        ),
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.vault_wsol_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Wrapa SOL para WSOL via CPI
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        anchor_spl::token::SyncNative {
            account: ctx.accounts.vault_wsol_account.to_account_info(),
        },
    );
    anchor_spl::token::sync_native(cpi_ctx)?;

    // Atualiza o saldo interno do usuário na conta do programa
    user.gas_balance = user.gas_balance.saturating_add(amount);

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
    let user_key = user.key();

    require!(user.gas_balance >= amount, ErrorCode::InsufficientGasBalance);

    user.gas_balance = user.gas_balance.saturating_sub(amount);

    // Seeds e bump para PDA (vault_wsol_account)
    let bump = ctx.bumps.vault_wsol_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[b"vault_sol",user_key.as_ref(), &[bump]]];

    // Transfere WSOL da vault para o destino
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_wsol_account.to_account_info(),
            to: ctx.accounts.user_wsol_account.to_account_info(),
            authority: ctx.accounts.vault_wsol_authority.to_account_info(),
        },
        signer_seeds
    );
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
    let user_key = user.key();

    // ✅ Verifica saldo
    if user.pass_balance < amount {
        return Err(error!(ErrorCode::InsufficientPassBalance));
    }

    // 🔁 Atualiza saldo
    user.pass_balance = user.pass_balance.saturating_sub(amount);

    // 💸 Transfere os tokens para o usuário
    let bump = ctx.bumps.vault_webdex_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[b"vault_webdex",user_key.as_ref(), &[bump]]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_webdex_account.to_account_info(),
            to: ctx.accounts.user_webdex_account.to_account_info(),
            authority: ctx.accounts.vault_webdex_authority.to_account_info(),
        },
        signer_seeds
    );
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
        from: ctx.accounts.user_token_account.to_account_info(),
        to: ctx.accounts.vault_token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(), // ✅ o dono da conta `from`
    };

    let cpi_transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
    );
    transfer(cpi_transfer_ctx, amount)?;

    // 2. Mint LP token para o usuário
    let bump = ctx.bumps.lp_mint_authority;

    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority",strategy_token.as_ref(), &[bump]]];

    let cpi_mint_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        MintTo {
            mint: ctx.accounts.lp_token.to_account_info(),
            to: ctx.accounts.sub_account_lp_token_account.to_account_info(),
            authority: ctx.accounts.lp_mint_authority.to_account_info(),
        },
        signer_seeds,
    );
    mint_to(cpi_mint_ctx, amount)?;

    // CHAMAR A FUNÇÂO ADD LIQUIDY DO CONTRATO SUB ACCOUNTS LOGO DEPOIS PARA ATUALIZAR OS VALORES DA SUB CONTA

    Ok(())
}

pub fn _liquidity_remove(
    ctx: Context<LiquidityRemove>,
    strategy_token: Pubkey,
    _decimals: u8,
    amount: u64,
) -> Result<()> {
    let strategy_list = &mut ctx.accounts.strategy_list;
    let sub_account = &mut ctx.accounts.sub_account;
    let sub_account_key = sub_account.key();
    
    // Verifique se a estratégia está ativa
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

    // 1. Burn LP token
    let bump = ctx.bumps.sub_account_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"sub_account",
        sub_account_key.as_ref(),
        &[bump],
    ]];

    let cpi_burn_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.lp_token.to_account_info(),
            from: ctx.accounts.sub_account_lp_token_account.to_account_info(),
            authority: ctx.accounts.sub_account_authority.to_account_info(),
        },
        signer_seeds,
    );
    burn(cpi_burn_ctx, amount)?;

    // 2. Transferir o token base de volta para o usuário
    let cpi_transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.sub_account_authority.to_account_info(),
        },
        signer_seeds
    );
    transfer(cpi_transfer_ctx, amount)?;

    Ok(())
}

pub fn _rebalance_position(
    ctx: Context<RebalancePosition>,
    _strategy_token: Pubkey,
    _decimals: u8, // USADO NA STRUCT EM lp_token
    amount: u64, // Quantidade de tokens LP para Mint/Burn
    gas: u64,   // Taxa em SOL (lamports) a ser paga ao bot_owner
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_key = user.key();
    let signer = &mut ctx.accounts.signer;
    let temporary_rebalance = &mut ctx.accounts.temporary_rebalance;
    let sub_account = &mut ctx.accounts.sub_account;
    let sub_account_key = sub_account.key();

    if ctx.accounts.bot.owner != signer.key() {
       return Err(ErrorCode::YouMustTheWebDexPayments.into());
    }

    if temporary_rebalance.fee == 0 {
        return Err(ErrorCode::InvalidTemporaryFee.into());
    }

    // ⚠️ Valida saldo suficiente
    if user.gas_balance < gas {
        return Err(ErrorCode::InsufficientGasBalance.into());
    }
    if user.pass_balance < temporary_rebalance.fee {
        return Err(ErrorCode::InsufficientPassBalance.into());
    }

    // Atualiza saldos
    user.gas_balance = user.gas_balance.saturating_sub(gas);
    user.pass_balance = user.pass_balance.saturating_sub(temporary_rebalance.fee);

    if amount > 0 {
        let bump = ctx.bumps.lp_mint_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority",_strategy_token.as_ref(), &[bump]]];

        // Mint
        let cpi_mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lp_token.to_account_info(),
                to: ctx.accounts.sub_account_lp_token_account.to_account_info(),
                authority: ctx.accounts.lp_mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_mint_ctx, amount)?;
    } else {
        let bump = ctx.bumps.sub_account_authority;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"sub_account",
            sub_account_key.as_ref(),
            &[bump],
        ]];
        
        // Burn
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lp_token.to_account_info(),
                from: ctx.accounts.sub_account_lp_token_account.to_account_info(),
                authority: ctx.accounts.sub_account_authority.to_account_info(),
            },
            signer_seeds,
        );
        burn(cpi_ctx, amount)?;
    }

    // Transfere WSOL da vault para o bot_owner
    let bump = ctx.bumps.vault_wsol_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[b"vault_sol",user_key.as_ref(), &[bump]]];

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_wsol_account.to_account_info(),
            to: ctx.accounts.owner_wsol_account.to_account_info(),
            authority: ctx.accounts.vault_wsol_authority.to_account_info(),
        },
        signer_seeds
    );
    transfer(cpi_ctx, gas)?;

    temporary_rebalance.fee = 0;

    // Emite eventos (você pode adaptar para seus eventos atuais)
    emit!(BalanceGasEvent {
        user: user_key,
        balance: user.gas_balance,
        value: gas,
        increase: false,
        is_operation: true,
    });

    emit!(BalancePassEvent {
        user: user_key,
        balance: user.pass_balance,
        value: temporary_rebalance.fee,
        increase: false,
        is_operation: true,
    });

    Ok(())
}