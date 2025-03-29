use anchor_lang::prelude::*;
use crate::state::factory::{AddBot, UpdateBot, RemoveBot, FactoryBot, GetBotInfo};

#[error_code]
pub enum ErrorCode {
    #[msg("O endereço do contrato fornecido é inválido.")]
    InvalidContractAddress
}

impl FactoryBot {
    pub fn add_bot(
        ctx: Context<AddBot>,
        name: String,
        prefix: String,
        owner: Pubkey,
        contract_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
    ) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        bot.name = name;
        bot.prefix = prefix;
        bot.owner = owner;
        bot.contract_address = contract_address;
        bot.strategy_address = strategy_address;
        bot.sub_account_address = sub_account_address;
        bot.payments_address = payments_address;
        bot.token_pass_address = token_pass_address;
        Ok(())
    }
    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
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
        Ok(())
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        bot.owner = Pubkey::default(); // Marca como deletado
        Ok(())
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<FactoryBot> {
        // Verifica se o endereço da conta corresponde ao contract_address fornecido
        if ctx.accounts.bot.key() != contract_address {
            return Err(ErrorCode::InvalidContractAddress.into());
        }

        // Acessa os dados da conta 'bot' sem cloná-los
        let bot_data: &FactoryBot = &ctx.accounts.bot;

        // Retorna os dados do bot
        Ok(bot_data.clone())
    }
}