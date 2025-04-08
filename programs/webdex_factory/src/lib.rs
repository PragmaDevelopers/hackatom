use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    create_metadata_accounts_v3,
    CreateMetadataAccountsV3,
};
use mpl_token_metadata::types::DataV2;
use mpl_token_metadata::accounts::Metadata;

pub mod factory;
pub mod payments;
pub mod strategy;
pub mod error;

use crate::factory::*;
use crate::payments::*;
use crate::strategy::*;
use crate::error::ErrorCode;

declare_id!("B8YC8hQT7ox647xPKk5JhpwD9NPMUXXRxo8yfyGX6nyW");

#[program]
pub mod webdex_factory {

    use super::*;

    pub fn add_bot_fee_tiers(
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
        payments.fee_tiers.extend(new_fee_tiers);
        Ok(())
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
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

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        if bot.contract_address == Pubkey::default() {
            return Err(ErrorCode::BotNotFound.into());
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
        Ok(())
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        if bot.contract_address == Pubkey::default() {
            return Err(ErrorCode::BotNotFound.into());
        }
        bot.owner = Pubkey::default(); // Marca como deletado
        Ok(())
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        // Preparando os dados para a chamada CPI
        let bot = &ctx.accounts.bot;
        let payments = &mut ctx.accounts.payments;

        // Verifica se o bot está registrado
        if bot.contract_address != payments.contract_address {
            return Err(ErrorCode::BotNotFound.into());
        }

        if let Some((_pubkey, coin)) = payments.coins.iter_mut().find(|(pubkey, _)| *pubkey == coin) {
            coin.status = true;
            Ok(())
        } else {
            Err(ErrorCode::CoinNotFound.into())
        }
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        // Preparando os dados para a chamada CPI
        let bot = &ctx.accounts.bot;
        let payments = &mut ctx.accounts.payments;

        // Verifica se o bot está registrado
        if bot.contract_address != payments.contract_address {
            return Err(ErrorCode::BotNotFound.into());
        }

        if let Some((_pubkey, coin)) = payments.coins.iter_mut().find(|(pubkey, _)| *pubkey == coin) {
            coin.status = false;
            Ok(())
        } else {
            Err(ErrorCode::CoinNotFound.into())
        }
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

        if bot.contract_address == Pubkey::default() {
            bot.contract_address = contract_address;
        } else if bot.contract_address != contract_address {
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

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
        let bot = &ctx.accounts.bot;
        let strategy_list = &mut ctx.accounts.strategy_list;
        if bot.contract_address != contract_address {
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
}