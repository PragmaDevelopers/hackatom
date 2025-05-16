use anchor_lang::prelude::*;
use crate::state::*;
use crate::authority::{_get_authorized_managers};
use crate::error::ErrorCode;
use anchor_lang::solana_program::{
    program::{invoke, invoke_signed},
    system_instruction,
};
use anchor_spl::token::{MintTo, Burn, mint_to, burn, transfer, Transfer};
use webdex_sub_accounts::{state::RemoveLiquidity, processor::_remove_liquidity};

pub fn _register_manager(ctx: Context<RegisterManager>) -> Result<()> {
    let allowed_managers = _get_authorized_managers();
    let manager = ctx.accounts.signer.key();
    require!(
        allowed_managers.contains(&manager),
        ErrorCode::Unauthorized
    );

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

pub fn _register(ctx: Context<Register>) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let manager = &mut ctx.accounts.manager;

    if manager.key() != Pubkey::default() {
        if !manager.status {
            return Err(ErrorCode::UnregisteredManager.into());
        }
    }

    if user.status {
        return Err(ErrorCode::RegisteredUser.into());
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

    // Transfere SOL do signer para o vault
    invoke(
        &system_instruction::transfer(
            &ctx.accounts.signer.key(),
            &ctx.accounts.vault_sol_account.key(),
            amount,
        ),
        &[
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.vault_sol_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    // Atualiza o saldo de gas na conta do usuário
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

    // Transfere SOL do vault para o signer (usuário)
    let seeds = &[b"vault_sol_account", user_key.as_ref(), &[ctx.bumps.vault_sol_account]];
    invoke_signed(
        &system_instruction::transfer(
            &ctx.accounts.vault_sol_account.key(),
            &ctx.accounts.signer.key(),
            amount,
        ),
        &[
            ctx.accounts.vault_sol_account.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
    )?;

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

    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority",strategy_token.as_ref(), &[bump]]];

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

pub fn _liquidity_remove(
    ctx: Context<LiquidityRemove>,
    strategy_token: Pubkey,
    _decimals: u8,
    account_id: String,
    coin: Pubkey, // Token base, por exemplo, USDT
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

    // 1. Remover a liquidez da subconta
    let cpi_ctx_sub_accounts = CpiContext::new(
        ctx.accounts.sub_account_program.clone(),
        RemoveLiquidity {
            bot: ctx.accounts.bot.clone(),
            sub_account: sub_account.clone(),
            strategy_balance: ctx.accounts.strategy_balance.clone(),
        },
    );

     _remove_liquidity(
        cpi_ctx_sub_accounts,
        account_id.clone(),
        strategy_token,
        coin,
        amount,
    )?;

    // 2. Burn LP token
    let bump = ctx.bumps.lp_mint_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority",strategy_token.as_ref(), &[bump]]];

    let cpi_burn_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Burn {
            mint: ctx.accounts.lp_token.to_account_info(),
            from: ctx.accounts.user_lp_token_account.to_account_info(),
            authority: ctx.accounts.user_authority.to_account_info(),
        },
        signer_seeds,
    );
    burn(cpi_burn_ctx, amount)?;

    // 3. Transferir o token base de volta para o usuário
    let bump = ctx.bumps.sub_account_authority;

    let signer_seeds: &[&[&[u8]]] = &[&[
        b"sub_account",
        sub_account_key.as_ref(),
        &[bump],
    ]];

    let cpi_transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.vault_usdt_account.to_account_info(),
            to: ctx.accounts.user_usdt_account.to_account_info(),
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
    amount: u64,
    gas: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_key = user.key();
    let signer = &mut ctx.accounts.signer;
    let temporary_fee_account = ctx.accounts.temporary_fee_account.fee;

    if ctx.accounts.bot.payments_address != signer.key() {
       return Err(ErrorCode::YouMustTheWebDexPayments.into());
    }

    // ⚠️ Valida saldo suficiente
    if user.gas_balance < gas {
        return Err(ErrorCode::InsufficientGasBalance.into());
    }
    if user.pass_balance < temporary_fee_account {
        return Err(ErrorCode::InsufficientPassBalance.into());
    }

    // Atualiza saldos
    user.gas_balance = user.gas_balance.saturating_sub(gas);
    user.pass_balance = user.pass_balance.saturating_sub(temporary_fee_account);

    let bump = ctx.bumps.lp_mint_authority;
    let signer_seeds: &[&[&[u8]]] = &[&[b"mint_authority",_strategy_token.as_ref(), &[bump]]];

    if amount > 0 {
        // Cálculo da distribuição
        let user_amount = amount * 80 / 100;
        let owner_amount = amount * 15 / 100;
        let collector_amount = amount * 125 / 10000;

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

        // Mint para owner
        let cpi_ctx_owner = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.lp_token.to_account_info(),
                to: ctx.accounts.bot_owner_lp_account.to_account_info(),
                authority: ctx.accounts.lp_mint_authority.to_account_info(),
            },
            signer_seeds,
        );
        mint_to(cpi_ctx_owner, owner_amount)?;

        // Mint para collectors
        let collector_accounts = [
            &ctx.accounts.collector_1_lp_account,
            &ctx.accounts.collector_2_lp_account,
            &ctx.accounts.collector_3_lp_account,
            &ctx.accounts.collector_4_lp_account,
        ];

        for collector_account in collector_accounts.iter() {
            let cpi_ctx_collector = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.lp_token.to_account_info(),
                    to: collector_account.to_account_info(),
                    authority: ctx.accounts.lp_mint_authority.to_account_info(),
                },
                signer_seeds,
            );
            mint_to(cpi_ctx_collector, collector_amount)?;
        }
    } else {
        // Burn
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.lp_token.to_account_info(),
                from: ctx.accounts.user_lp_token_account.to_account_info(),
                authority: ctx.accounts.user_authority.to_account_info(),
            },
            signer_seeds,
        );
        burn(cpi_ctx, amount)?;
    }

    let signer_clone = &ctx.accounts.signer.key();
    let owner_clone = &ctx.accounts.bot.owner;

    // Transfera gas para o owner do bot
    let seeds = &[b"vault_sol_account", user_key.as_ref(), &[ctx.bumps.vault_sol_account]];
    invoke_signed(
        &system_instruction::transfer(
            &ctx.accounts.vault_sol_account.key(),
            owner_clone,
            gas,
        ),
        &[
            ctx.accounts.vault_sol_account.to_account_info(),
            ctx.accounts.bot_owner.clone(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[seeds],
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
        value: temporary_fee_account,
        increase: false,
        is_operation: true,
    });

    Ok(())
}