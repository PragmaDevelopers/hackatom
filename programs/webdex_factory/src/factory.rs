use anchor_lang::prelude::*;
use crate::payments::*;

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

impl Bot {
    pub const INIT_SPACE: usize = 8 + 36 + 14 + 32 * 6;
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BotInfo {
    pub name: String,
    pub prefix: String,
    pub owner: Pubkey,
    pub contract_address: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
    pub token_pass_address: Pubkey,
}

#[derive(Accounts)]
pub struct AddBotAndFeeTiers<'info> {
    #[account(
        init,
        payer = user,
        space = Bot::INIT_SPACE,
        seeds = [b"bot", contract_address.key().as_ref()],
        bump
    )]
    pub bot: Account<'info, Bot>,
    #[account(
        init_if_needed,
        payer = user,
        space = Payments::INIT_SPACE, // ou calcule o espaço necessário
        seeds = [b"payments", bot.key().as_ref()], // exemplo de seeds
        bump
    )]
    pub payments: Box<Account<'info, Payments>>,
    // Essa conta é só para obter o endereço do contrato (pode ser `UncheckedAccount`)
    /// CHECK: não estamos lendo nem escrevendo
    pub contract_address: UncheckedAccount<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct BotCreated {
    pub contract_address: Pubkey,
    pub bot: Pubkey,
    pub owner: Pubkey,
}

#[derive(Accounts)]
pub struct GetBotInfo<'info> {
    // Essa conta já deve ter sido inicializada e conter os dados do bot
    #[account()]
    pub bot: Account<'info, Bot>,
}

#[derive(Accounts)]
pub struct UpdateBot<'info> {
    #[account(mut, has_one = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}

#[event]
pub struct BotUpdated {
    pub bot: Pubkey,
    pub strategy_address: Pubkey,
    pub sub_account_address: Pubkey,
    pub payments_address: Pubkey,
}

#[derive(Accounts)]
pub struct RemoveBot<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}

#[event]
pub struct BotRemoved {
    pub bot: Pubkey,
    pub owner: Pubkey,
}