use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    create_metadata_accounts_v3,
    CreateMetadataAccountsV3,
};
use mpl_token_metadata::types::DataV2;

use crate::state::*;

use crate::error::ErrorCode;

pub fn _add_strategy(
    ctx: Context<AddStrategy>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let bot = &mut ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    if strategy_list.strategies.len() >= StrategyList::MAX_STRATEGIES {
        return Err(ErrorCode::MaxStrategiesReached.into());
    }

    let token_address = ctx.accounts.token_mint.key();

    // Criar estrutura DataV2 para metadados
    
    // let metadata_data = DataV2 {
    //     name: name.clone(),
    //     symbol: symbol.clone(),
    //     uri: uri.clone(),
    //     seller_fee_basis_points: 0,
    //     creators: None,
    //     collection: None,
    //     uses: None,
    // };

    // Criar o CpiContext para a instrução
    
    // let cpi_accounts = CreateMetadataAccountsV3 {
    //     metadata: ctx.accounts.metadata.to_account_info(),
    //     mint: ctx.accounts.token_mint.to_account_info(),
    //     mint_authority: ctx.accounts.signer.to_account_info(),
    //     payer: ctx.accounts.signer.to_account_info(),
    //     update_authority: ctx.accounts.signer.to_account_info(),
    //     system_program: ctx.accounts.system_program.to_account_info(),
    //     rent: ctx.accounts.rent.to_account_info(),
    // };
    // let cpi_program = ctx.accounts.metadata_program.to_account_info();
    // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    // Chamar a função create_metadata_accounts_v3
    
    // create_metadata_accounts_v3(
    //     cpi_ctx,
    //     metadata_data,
    //     true,
    //     false,
    //     None,
    // )?;

    // ✅ Se a conta strategy_list já tinha bot, não sobrescreve
    if strategy_list.bot == Pubkey::default() {
        strategy_list.bot = bot.key();
    } else if strategy_list.bot != bot.key() {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    let name_clone = name.clone();        

    let strategy = Strategy {
        name,
        token_address,
        is_active: true,
    };
    
    strategy_list.strategies.push(strategy);

    emit!(StrategyAddedEvent {
        bot: bot.key(),
        name: name_clone,
        symbol,
        uri,
        token_address,
    });

    Ok(())
}

pub fn _update_strategy_status(ctx: Context<UpdateStrategyStatus>, token_address: Pubkey, is_active: bool) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }
    
    if let Some(strategy) = strategy_list.strategies.iter_mut().find(|s| s.token_address == token_address) {
        strategy.is_active = is_active;
        emit!(StrategyStatusUpdatedEvent {
            bot: bot.key(),
            token_address: token_address,
            is_active: true,
        });
    } else {
        return Err(ErrorCode::StrategyNotFound.into());
    }

    Ok(())
}

pub fn _get_strategies(ctx: Context<GetStrategies>) -> Result<Vec<Strategy>> {
    let strategy_list = &ctx.accounts.strategy_list;
    Ok(strategy_list.strategies.clone())
}

pub fn _find_strategy(
    ctx: Context<FindStrategy>,
    token_address: Pubkey,
) -> Result<Strategy> {
    let strategy_list = &ctx.accounts.strategy_list;

    // Procura a strategy pelo token_address
    if let Some(strategy) = strategy_list
        .strategies
        .iter()
        .find(|s| s.token_address == token_address)
    {
        Ok(strategy.clone())
    } else {
        Err(ErrorCode::StrategyNotFound.into())
    }
}

pub fn _delete_strategy(
    ctx: Context<DeleteStrategy>,
    token_address: Pubkey,
) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != ctx.accounts.signer.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    let initial_len = strategy_list.strategies.len();

    // Retém somente as estratégias que **não** têm o token_address passado
    strategy_list.strategies.retain(|s| s.token_address != token_address);

    if strategy_list.strategies.len() == initial_len {
        return Err(ErrorCode::StrategyNotFound.into());
    }

    emit!(StrategyStatusUpdatedEvent {
        bot: bot.key(),
        token_address,
        is_active: false,
    });

    Ok(())
}