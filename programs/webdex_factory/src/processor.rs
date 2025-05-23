use anchor_lang::prelude::*;
use crate::state::*;
use shared_factory::state::{Bot};
use crate::error::ErrorCode;
use shared_factory::authority::{
    _fixed_authorized_owner,
    _fixed_fee_collector_network,
    _fixed_void_collector_1,
    _fixed_void_collector_2,
    _fixed_void_collector_3,
    _fixed_void_collector_4
};

pub fn assert_only_owner(signer: &Pubkey, bot: &Account<Bot>) -> Result<()> {
    require!(
        *signer == bot.owner,
        ErrorCode::UnauthorizedOwner
    );
    Ok(())
}

pub fn _add_bot(
    ctx: Context<AddBot>,
    name: String,
    prefix: String,
    owner: Pubkey,
    void_collector_1: Pubkey,
    void_collector_2: Pubkey,
    void_collector_3: Pubkey,
    void_collector_4: Pubkey,
    fee_withdraw_void: u64,
    contract_address: Pubkey,
    strategy_address: Pubkey,
    sub_account_address: Pubkey,
    payments_address: Pubkey,
    token_pass_address: Pubkey,
    fee_withdraw_network: u64,
    fee_collector_network_address: Pubkey,
) -> Result<()> {
    // ✅ Verificações de campos fixos
    require_keys_eq!(owner, _fixed_authorized_owner(), ErrorCode::UnauthorizedOwner);
    require_keys_eq!(void_collector_1, _fixed_void_collector_1(), ErrorCode::UnauthorizedVoidCollector);
    require_keys_eq!(void_collector_2, _fixed_void_collector_2(), ErrorCode::UnauthorizedVoidCollector);
    require_keys_eq!(void_collector_3, _fixed_void_collector_3(), ErrorCode::UnauthorizedVoidCollector);
    require_keys_eq!(void_collector_4, _fixed_void_collector_4(), ErrorCode::UnauthorizedVoidCollector);
    require_keys_eq!(fee_collector_network_address, _fixed_fee_collector_network(), ErrorCode::UnauthorizedFeeCollectorNetwork);

    let bot = &mut ctx.accounts.bot;

    // ⚠️ Evita sobrescrever bot já existente
    if bot.manager_address != Pubkey::default() {
        return Err(ErrorCode::BotAlreadyRegistered.into());
    }

    bot.name = name;
    bot.prefix = prefix;
    bot.owner = owner;
    bot.void_collector_1 = void_collector_1;
    bot.void_collector_2 = void_collector_2;
    bot.void_collector_3 = void_collector_3;
    bot.void_collector_4 = void_collector_4;
    bot.fee_withdraw_void = fee_withdraw_void;
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
        void_collector_1: bot.void_collector_1,
        void_collector_2: bot.void_collector_2,
        void_collector_3: bot.void_collector_3,
        void_collector_4: bot.void_collector_4,
        fee_withdraw_void: bot.fee_withdraw_void,
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
    assert_only_owner(&ctx.accounts.signer.key(), &ctx.accounts.bot)?;

    let bot = &mut ctx.accounts.bot;
    
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
    assert_only_owner(&ctx.accounts.signer.key(), &ctx.accounts.bot)?;

    let bot_pubkey = ctx.accounts.bot.key();
    let bot = &mut ctx.accounts.bot;

    if bot.manager_address == Pubkey::default() {
        return Err(ErrorCode::BotNotFound.into());
    }

    emit!(BotRemoved {
        bot: bot_pubkey,
        owner: bot.owner,
    });

    Ok(())
}