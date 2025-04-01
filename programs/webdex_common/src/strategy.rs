use anchor_lang::prelude::*;
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use crate::factory::*;
use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct AddStrategy<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
    #[account(init, payer = signer, mint::decimals = 0, mint::authority = signer.key())]
    pub token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategyStatus<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
}

#[account]
pub struct Strategy {
    pub name: String,
    pub token_address: Pubkey,
    pub is_active: bool,
}

#[account]
pub struct StrategyList {
    pub strategies: Vec<Strategy>,
}

#[derive(Accounts)]
pub struct GetStrategies<'info> {
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct FindStrategy<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    pub strategy_list: Account<'info, StrategyList>,
}

pub fn _find_strategy(
    ctx: Context<FindStrategy>,
    contract_address: Pubkey,
    token_address: Pubkey,
) -> Result<Strategy> {
    let bot = &ctx.accounts.bot;
    let strategy_list = &ctx.accounts.strategy_list;

    // Verifica se o bot está registrado
    if bot.manager_address != contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    // Itera sobre as estratégias para encontrar a correspondente
    for strategy in &strategy_list.strategies {
        if strategy.token_address == token_address {
            return Ok(strategy.clone());
        }
    }

    // Retorna uma estratégia padrão caso não encontre a desejada
    Ok(Strategy {
        name: "unknown".to_string(),
        token_address: Pubkey::default(),
        is_active: false,
    })
}

pub fn _add_strategy(ctx: Context<AddStrategy>, name: String, contract_address: Pubkey) -> Result<()> {
    let bot = &mut ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;
    // Se o manager_address estiver padrão, inicializa com contract_address
    if bot.manager_address == Pubkey::default() {
        bot.manager_address = contract_address;
    } else if bot.manager_address != contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }
    // Criar NFT (Token Mint)
    let token_address = ctx.accounts.token_mint.key();
    let strategy = Strategy {
        name,
        token_address,
        is_active: true,
    };
    strategy_list.strategies.push(strategy);
    Ok(())
}

pub fn _update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;
    if bot.manager_address != contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }
    if let Some(strategy) = strategy_list.strategies.iter_mut().find(|s| s.token_address == token_address) {
        strategy.is_active = is_active;
    } else {
        return Err(ErrorCode::StrategyNotFound.into());
    }
    Ok(())
}

pub fn _get_strategies(ctx: Context<GetStrategies>) -> Result<Vec<Strategy>> {
    let strategy_list = &ctx.accounts.strategy_list;
    Ok(strategy_list.strategies.clone())
}