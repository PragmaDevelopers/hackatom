use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token};
use anchor_spl::metadata::{
    create_metadata_accounts_v3,
    CreateMetadataAccountsV3,
};
use mpl_token_metadata::types::DataV2;
use mpl_token_metadata::accounts::Metadata;
use crate::factory::*;
use crate::error::ErrorCode;

#[account]
pub struct Strategy {
    pub name: String,
    pub token_address: Pubkey,
    pub is_active: bool,
}

impl Strategy {
    pub const MAX_SIZE: usize = 4 + 32 + 1; // name (4 + x), token_address (32), is_active (1)
}

#[account]
pub struct StrategyList {
    pub contract_address: Pubkey,  
    pub strategies: Vec<Strategy>,
}

impl StrategyList {
    pub const MAX_STRATEGIES: usize = 10;
    pub const INIT_SPACE: usize = 8 + 32 + 4 + Self::MAX_STRATEGIES * Strategy::MAX_SIZE;
}

#[derive(Accounts)]
pub struct AddStrategy<'info> {
     #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(
        init_if_needed,
        payer = payer,
        space = StrategyList::INIT_SPACE,
        seeds = [b"strategy_list", bot.key().as_ref()],
        bump
    )]
    pub strategy_list: Account<'info, StrategyList>,
    #[account(init, payer = payer, mint::decimals = 0, mint::authority = token_authority.key())]
    pub token_mint: Account<'info, Mint>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    pub metadata_program: AccountInfo<'info>,
    /// CHECK: Esta conta é verificada pelo programa Metaplex
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub token_authority: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateStrategyStatus<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    #[account(mut)]
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct FindStrategy<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,
    pub strategy_list: Account<'info, StrategyList>,
}

#[derive(Accounts)]
pub struct GetStrategies<'info> {
    pub strategy_list: Account<'info, StrategyList>,
}

#[event]
pub struct StrategyAddedEvent {
    pub contract_address: Pubkey,
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub token_address: Pubkey,
}

#[event]
pub struct StrategyStatusUpdatedEvent {
    pub contract_address: Pubkey,
    pub token_address: Pubkey,
    pub is_active: bool,
}

pub fn _add_strategy(
    ctx: Context<AddStrategy>,
    name: String,
    symbol: String,
    uri: String,
    contract_address: Pubkey,
) -> Result<()> {
    let bot = &mut ctx.accounts.bot;
    let strategy_list = &mut ctx.accounts.strategy_list;

    if bot.manager_address == Pubkey::default() {
        bot.manager_address = contract_address;
    } else if bot.manager_address != contract_address {
        return Err(ErrorCode::BotNotFound.into());
    }

    let token_address = ctx.accounts.token_mint.key();

    // Criar estrutura DataV2 para metadados
    let metadata_data = DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // Criar o CpiContext para a instrução
    let cpi_accounts = CreateMetadataAccountsV3 {
        metadata: ctx.accounts.metadata.to_account_info(),
        mint: ctx.accounts.token_mint.to_account_info(),
        mint_authority: ctx.accounts.token_authority.to_account_info(),
        payer: ctx.accounts.payer.to_account_info(),
        update_authority: ctx.accounts.token_authority.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        rent: ctx.accounts.rent.to_account_info(),
    };
    let cpi_program = ctx.accounts.metadata_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

    // Chamar a função create_metadata_accounts_v3
    create_metadata_accounts_v3(
        cpi_ctx,
        metadata_data,
        true,
        false,
        None,
    )?;

    let strategy = Strategy {
        name,
        token_address,
        is_active: true,
    };
    strategy_list.strategies.push(strategy);

    emit!(StrategyStatusUpdatedEvent {
        contract_address,
        token_address,
        is_active: true,
    });

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
        emit!(StrategyStatusUpdatedEvent {
            contract_address: contract_address,
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