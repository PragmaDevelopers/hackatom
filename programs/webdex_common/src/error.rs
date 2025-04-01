use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("O endereço do contrato fornecido é inválido.")]
    InvalidContractAddress,
    #[msg("Bot not found")]
    BotNotFound,
    #[msg("Bot already registered")]
    BotAlreadyRegistered,
    #[msg("A moeda especificada não foi encontrada.")]
    CoinNotFound,
    #[msg("Strategy not found")]
    StrategyNotFound,
}