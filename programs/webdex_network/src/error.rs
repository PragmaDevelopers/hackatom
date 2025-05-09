use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient Balance")]
    InsufficientBalance,
    #[msg("Overflow")]
    Overflow
}