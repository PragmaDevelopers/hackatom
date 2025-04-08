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
    #[msg("Unregistered manager")]
    UnregisteredManager,
    #[msg("User already registered")]
    UserAlreadyRegistered,
    #[msg("The required account is missing.")]
    MissingAccount,
    #[msg("The provided account is invalid.")]
    InvalidAccount,
    #[msg("Você não tem permissão para acessar esta subconta.")]
    UnauthorizedSubAccount,
    #[msg("SubAccount not found")]
    SubAccountNotFound,
    #[msg("Account not linked to currency")]
    AccountNotLinkedToCurrency,
}