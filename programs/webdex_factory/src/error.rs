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
    #[msg("Coin already exists")]
    CoinAlreadyExists,
    #[msg("Max strategies reached")]
    MaxStrategiesReached,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Você não tem permissão para acessar esta subconta.")]
    UnauthorizedSubAccount,
    #[msg("Account not linked to currency")]
    AccountNotLinkedToCurrency,
    #[msg("Invalid Sub Account Id")]
    InvalidSubAccountId,
    #[msg("Strategy Not Linked")]
    StrategyNotLinked,
    #[msg("Strategy Balance Not Found")]
    StrategyBalanceNotFound,
    #[msg("Coin Not Linked")]
    CoinNotLinked,
    #[msg("Account not found")]
    AccountNotFound
}