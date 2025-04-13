use anchor_lang::prelude::*;
use crate::factory::state::{BotInfo,AddBotAndFeeTiers,GetBotInfo,UpdateBot,RemoveBot,BotCreated,BotUpdated,BotRemoved};
use crate::payments::state::FeeTier;
use crate::error::ErrorCode;

pub fn _add_bot_fee_tiers(
    ctx: Context<AddBotAndFeeTiers>,
    name: String,
    prefix: String,
    owner: Pubkey,
    contract_address: Pubkey,
    strategy_address: Pubkey,
    sub_account_address: Pubkey,
    payments_address: Pubkey,
    token_pass_address: Pubkey,
    new_fee_tiers: Vec<FeeTier>,
) -> Result<()> {
    let bot = &mut ctx.accounts.bot;

    // ⚠️ Evita sobrescrever bot já existente
    if bot.contract_address != Pubkey::default() {
        return Err(ErrorCode::BotAlreadyRegistered.into());
    }

    bot.name = name;
    bot.prefix = prefix;
    bot.owner = owner;
    bot.contract_address = contract_address;
    bot.strategy_address = strategy_address;
    bot.sub_account_address = sub_account_address;
    bot.payments_address = payments_address;
    bot.token_pass_address = token_pass_address;

    let payments = &mut ctx.accounts.payments;

    // ✅ Se a conta payments já tinha contract_address, não sobrescreve
    if payments.contract_address == Pubkey::default() {
        payments.contract_address = contract_address;
    } else if payments.contract_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // ✅ Só adiciona fee tiers se ainda não tiver
    if payments.fee_tiers.is_empty() {
        payments.fee_tiers.extend(new_fee_tiers);
    }

    emit!(BotCreated {
        contract_address,
        bot: bot.key(),
        owner,
    });

    Ok(())
}

pub fn _get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
    let bot = &ctx.accounts.bot;

    if bot.contract_address != contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    Ok(BotInfo {
        name: bot.name.clone(),
        prefix: bot.prefix.clone(),
        owner: bot.owner,
        contract_address: bot.contract_address,
        strategy_address: bot.strategy_address,
        sub_account_address: bot.sub_account_address,
        payments_address: bot.payments_address,
        token_pass_address: bot.token_pass_address,
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
    if bot.owner != ctx.accounts.owner.key() {
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

    if bot.owner != ctx.accounts.owner.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    if bot.contract_address == Pubkey::default() {
        return Err(ErrorCode::BotNotFound.into());
    }

    emit!(BotRemoved {
        bot: bot_pubkey,
        owner: bot.owner,
    });

    Ok(())
}