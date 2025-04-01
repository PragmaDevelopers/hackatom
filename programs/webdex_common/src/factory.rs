use anchor_lang::prelude::*;
use crate::error::ErrorCode;

#[account]
pub struct Bot {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub manager_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[derive(Accounts)]
pub struct GetBotInfo<'info> {
    // Essa conta já deve ter sido inicializada e conter os dados do bot
    #[account()]
    pub bot: Account<'info, Bot>,
}

pub fn _get_bot_info(ctx: Context<GetBotInfo>, manager_address: Pubkey) -> Result<Bot> {
    // Verifica se o endereço da conta corresponde ao manager_address fornecido
    if ctx.accounts.bot.key() != manager_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // Acessa os dados da conta 'bot' sem cloná-los
    let bot_data: &Bot = &ctx.accounts.bot;

    // Retorna os dados do bot
    Ok(bot_data.clone())
}