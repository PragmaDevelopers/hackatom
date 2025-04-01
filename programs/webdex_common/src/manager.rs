use anchor_lang::prelude::*;
use anchor_lang::prelude::borsh::{BorshDeserialize, BorshSerialize};
use serde::{Deserialize, Serialize};
use anchor_spl::token::Mint;
use anchor_spl::token::Token;
use crate::factory::*;
use crate::error::ErrorCode;

#[account]
pub struct BalanceStrategy {
    pub amount: [u8; 32],
    pub token: Pubkey,
    pub decimals: [u8; 32],
    pub ico: String,
    pub name: String,
    pub status: bool,
    pub paused: bool,
}

#[account]
pub struct StrategyDisplay  {
    pub strategy_token: Pubkey,
    pub balance: Vec<BalanceStrategy>
}

#[account]
pub struct SubAccountsDisplay {
    pub id: u64,
    pub name: String,
    pub strategies: Vec<StrategyDisplay>
}

#[account]
pub struct SubAccount {
    pub owner: Pubkey,
    pub name: String,
    pub id: u64,
}

impl SubAccount {
    // 32 bytes para Pubkey, 8 bytes para o u64, e para a string consideramos 4 bytes para o tamanho + tamanho máximo em bytes
    pub const LEN: usize = 32 + 8 + 4 + 32; // Exemplo: nome com até 32 bytes
}

#[account]
pub struct User {
    pub manager: Pubkey,
    pub gas_balance: [u8; 32],
    pub pass_balance: [u8; 32],
    pub status: bool,
}

impl User {
    pub const LEN: usize = 32   // manager: Pubkey
        + 32                   // gas_balance: [u8; 32]
        + 32                   // pass_balance: [u8; 32]
        + 1;                   // status: bool
}

#[account]
pub struct UserDisplay {
    pub manager: Pubkey,
    pub gas_balance: [u8; 32],
    pub pass_balance: [u8; 32],
    pub sub_accounts: Vec<SubAccountsDisplay>,
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone, Default)]
pub struct Coin {
    pub status: bool,
    // Armazenamos apenas o Pubkey da conta mint do LPToken
    pub lp_token_mint: Pubkey,
}

#[account]
pub struct CoinList {
    pub coins: Vec<Coin>,
}

#[derive(Accounts)]
pub struct InitializeLpToken<'info> {
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer
    )]
    pub lp_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Contexto para a função register
#[derive(Accounts)]
pub struct RegisterAndCreateSubAccount<'info> {
    // Conta do usuário que será criada (registro)
    #[account(init, payer = payer, space = 8 + User::LEN)]
    pub user: Account<'info, User>,

    // Se o manager for fornecido, deve ser uma conta existente do User
    // Para simplificar, exigimos que seja sempre passado; se não houver, pode ser passado Pubkey::default()
    #[account(mut)]
    pub manager_user: Account<'info, User>,

    #[account(init, payer = user, space = 8 + SubAccount::LEN)]
    pub subaccount: Account<'info, SubAccount>,
    // Conta que mantém um contador para gerar IDs únicos para as subcontas
    #[account(mut)]
    pub id_generator: Account<'info, IDGenerator>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Uma conta simples para gerar IDs únicos
#[account]
pub struct IDGenerator {
    pub counter: u64,
}

impl IDGenerator {
    pub const LEN: usize = 8; // Apenas um u64
}

// Evento de registro
#[event]
pub struct RegisterEvent {
    pub user: Pubkey,
    pub manager: Pubkey,
}