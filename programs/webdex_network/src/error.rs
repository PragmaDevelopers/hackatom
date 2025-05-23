use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient Balance")]
    InsufficientBalance,
    #[msg("Overflow")]
    Overflow,
    #[msg("InvalidFeePercent")]
    InvalidFeePercent
}