use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("O endereço do contrato fornecido é inválido.")]
    InvalidContractAddress,
    #[msg("Bot not found")]
    BotNotFound,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Você não tem permissão para acessar esta subconta.")]
    UnauthorizedSubAccount,
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
    #[msg("Coin not linked to strategy")]
    CoinNotLinkedToStrategy,
    #[msg("The paused state must be different")]
    PauseStateUnchanged,
    #[msg("Only the registered Payments program can call this")]
    UnauthorizedPaymentsCaller,
    #[msg("Insufficient funds to subtract")]
    InsufficientFunds,
    #[msg("Unregistered Manager")]
    UnregisteredManager,
    #[msg("Unregistered User")]
    UnregisteredUser,
    #[msg("Insufficient Gas Balance")]
    InsufficientGasBalance,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Insufficient Pass Balance")]
    InsufficientPassBalance,
    #[msg("You must the WebDexPayments")]
    YouMustTheWebDexPayments,
    #[msg("Strategy Not Found")]
    StrategyNotFound
}