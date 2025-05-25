use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("O endereço do contrato fornecido é inválido.")]
    InvalidContractAddress,
    #[msg("Bot not found")]
    BotNotFound,
    #[msg("Bot already registered")]
    BotAlreadyRegistered,
    #[msg("Coin not found")]
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
    #[msg("SubAccount not found")]
    SubAccountNotFound,
    #[msg("Account not linked to currency")]
    AccountNotLinkedToCurrency,
    #[msg("Strategy Not Linked")]
    StrategyNotLinked,
    #[msg("Strategy Balance Not Found")]
    StrategyBalanceNotFound,
    #[msg("Coin Not Linked")]
    CoinNotLinked,
    #[msg("Status Must Be Different")]
    StatusMustBeDifferent,
    #[msg("Coin Not Registered")]
    CoinNotRegistered,
}