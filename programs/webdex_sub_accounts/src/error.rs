use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("O endereço do contrato fornecido é inválido.")]
    InvalidContractAddress,
    #[msg("Bot not found")]
    BotNotFound,
    #[msg("Bot already registered")]
    BotAlreadyRegistered,
    #[msg("Strategy not found")]
    StrategyNotFound,
    #[msg("You must the WebDexPayments")]
    YouMustTheWebDexPayments,
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
    #[msg("Max Sub Accounts Reached")]
    MaxSubAccountsReached,
    #[msg("Invalid Sub Account Id")]
    InvalidSubAccountId,
    #[msg("Strategy Not Linked")]
    StrategyNotLinked,
    #[msg("Strategy Balance Not Found")]
    StrategyBalanceNotFound,
    #[msg("Coin Not Linked")]
    CoinNotLinked,
    #[msg("Liquidity must be paused before removal")]
    MustPauseBeforeWithdraw,
    #[msg("Coin not found")]
    CoinNotFound,
    #[msg("Coin not linked to strategy")]
    CoinNotLinkedToStrategy,
    #[msg("The paused state must be different")]
    PauseStateUnchanged,
    #[msg("Only the registered Payments program can call this")]
    UnauthorizedPaymentsCaller,
    #[msg("Insufficient funds to subtract")]
    InsufficientFunds,
    #[msg("Insufficient funds to subtract")]
    DuplicateSubAccountName
}