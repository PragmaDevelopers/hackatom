use anchor_lang::prelude::*;
use serde::{Deserialize, Serialize};

declare_id!("CtL3hTB5hWhF9asHRJTRaYXYMCbZMuozanWHwLEiHGnH");

#[derive(Serialize, Deserialize, Default, Debug)]
#[account]
pub struct BotRegistry {
    pub bots: Vec<(Pubkey, Bot)>, // Usando Vec ao invés de HashMap
}

#[derive(Serialize, Deserialize, Default, Debug)]
#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub contract_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[program]
pub mod webdexfactory {
    use super::*;

    pub fn add_bot(
        ctx: Context<AddBot>,
        bot_name: String,
        prefix: String,
        owner: Pubkey,
        contract_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
    ) -> Result<()> {
        let bots = &mut ctx.accounts.bots.bots; // Acessando o Vec dentro de BotRegistry

        // Verificar se o bot já está registrado
        for (key, _bot) in bots.iter() {
            if *key == contract_address {
                return Err(ErrorCode::BotAlreadyRegistered.into());
            }
        }

        // Adicionar novo bot ao vetor
        let new_bot = Bot {
            name: bot_name.clone(),
            prefix,
            owner,
            contract_address,
            strategy_address,
            sub_account_address,
            payments_address,
            token_pass_address,
        };

        bots.push((contract_address, new_bot)); // Adicionando o bot ao Vec

        msg!("Bot added: {}", bot_name);
        Ok(())
    }

    pub fn check_bot(ctx: Context<CheckBot>, contract_address: Pubkey) -> Result<()> {
        let bots = &ctx.accounts.bots.bots; // Acessando o Vec dentro de BotRegistry

        // Verificando se o bot está no vetor
        for (key, _bot) in bots.iter() {
            if *key == contract_address {
                return Err(ErrorCode::BotNotFound.into());
            }
        }

        msg!("Bot found: {}", contract_address);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddBot<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut)]
    pub bots: Account<'info, BotRegistry>, // O tipo de Account para o BotRegistry
}

#[derive(Accounts)]
pub struct CheckBot<'info> {
    pub bots: Account<'info, BotRegistry>, // O tipo de Account para o BotRegistry
}

#[error_code]
pub enum ErrorCode {
    #[msg("Bot already registered")]
    BotAlreadyRegistered,
    #[msg("Bot not found")]
    BotNotFound,
}
