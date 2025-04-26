use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;

pub fn _add_bot(
    ctx: Context<AddBot>,
    name: String,
    prefix: String,
    owner: Pubkey,
    contract_address: Pubkey,
    strategy_address: Pubkey,
    sub_account_address: Pubkey,
    payments_address: Pubkey,
    token_pass_address: Pubkey,
    fee_withdraw_network: u64,
    fee_collector_network_address: Pubkey,
) -> Result<()> {
    let bot = &mut ctx.accounts.bot;

    // ⚠️ Evita sobrescrever bot já existente
    if bot.manager_address != Pubkey::default() {
        return Err(ErrorCode::BotAlreadyRegistered.into());
    }

    bot.name = name;
    bot.prefix = prefix;
    bot.owner = owner;
    bot.manager_address = contract_address;
    bot.strategy_address = strategy_address;
    bot.sub_account_address = sub_account_address;
    bot.payments_address = payments_address;
    bot.token_pass_address = token_pass_address;
    bot.fee_withdraw_network = fee_withdraw_network;
    bot.fee_collector_network_address = fee_collector_network_address;

    emit!(BotCreated {
        contract_address,
        bot: bot.key(),
        owner,
    });

    Ok(())
}

pub fn _get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
    let bot = &ctx.accounts.bot;

    if bot.manager_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    Ok(BotInfo {
        name: bot.name.clone(),
        prefix: bot.prefix.clone(),
        owner: bot.owner,
        manager_address: bot.manager_address,
        strategy_address: bot.strategy_address,
        sub_account_address: bot.sub_account_address,
        payments_address: bot.payments_address,
        token_pass_address: bot.token_pass_address,
        fee_withdraw_network: bot.fee_withdraw_network,
        fee_collector_network_address: bot.fee_collector_network_address,
    })
}

pub fn _update_bot(
    ctx: Context<UpdateBot>,
    strategy_address: Option<Pubkey>,
    sub_account_address: Option<Pubkey>,
    payments_address: Option<Pubkey>,
) -> Result<()> {
    let bot = &mut ctx.accounts.bot;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }
    
    if let Some(addr) = strategy_address {
        bot.strategy_address = addr;
    }
    if let Some(addr) = sub_account_address {
        bot.sub_account_address = addr;
    }
    if let Some(addr) = payments_address {
        bot.payments_address = addr;
    }

    emit!(BotUpdated {
        bot: bot.key(),
        strategy_address: bot.strategy_address,
        sub_account_address: bot.sub_account_address,
        payments_address: bot.payments_address,
    });

    Ok(())
}

pub fn _remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
    let bot_pubkey = ctx.accounts.bot.key();
    let bot = &mut ctx.accounts.bot;

    if bot.owner != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    if bot.manager_address == Pubkey::default() {
        return Err(ErrorCode::BotNotFound.into());
    }

    emit!(BotRemoved {
        bot: bot_pubkey,
        owner: bot.owner,
    });

    Ok(())
}