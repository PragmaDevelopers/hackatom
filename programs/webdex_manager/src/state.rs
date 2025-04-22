use anchor_lang::prelude::*;
use webdex_strategy::state::{StrategyList};
use shared_sub_accounts::state::{BalanceStrategy};
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use webdex_sub_accounts::state::{SubAccount};
use anchor_spl::token::{Token,TokenAccount,Mint};
use anchor_spl::associated_token::AssociatedToken;
use crate::error::ErrorCode;

#[account]
pub struct StrategyDisplay {
    pub strategy_token: Pubkey,
    pub balance: Vec<BalanceStrategy>,
}

#[account]
pub struct SubAccountsDisplay {
    pub id: u64,
    pub name: String,
    pub strategies: Vec<StrategyDisplay>,
}

#[account]
pub struct UserDisplay {
    pub manager: Pubkey,
    pub gas_balance: u64,
    pub pass_balance: u64,
}

#[account]
pub struct ManagerIndex {
    pub manager: Pubkey,
    pub users: Vec<Pubkey>, // endereços das contas dos usuários
}

impl ManagerIndex {
    pub const MAX_USERS: usize = 50; // ou algum limite que faça sentido
    pub const INIT_SPACE: usize = 8 + 32 + 4 + (32 * Self::MAX_USERS);
}

#[derive(Accounts)]
pub struct RegisterManager<'info> {
    #[account(
        init, 
        payer = signer, 
        space = User::SPACE, 
        seeds = [b"manager", signer.key().as_ref()], 
        bump
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Register<'info> {
    #[account(
        init, 
        payer = signer, 
        space = User::SPACE, 
        seeds = [b"user", signer.key().as_ref()], 
        bump
    )]
    pub user: Account<'info, User>,

    pub manager: Account<'info, User>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct RegisterEvent {
    pub user: Pubkey,
    pub manager: Pubkey,
}

#[derive(Accounts)]
pub struct GetInfoUser<'info> {
    #[account(
        seeds = [b"user", signer.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,

    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveGas<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::UnregisteredUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: Conta do programa que contém os fundos (ex: treasury)
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct AddGas<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::UnregisteredUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: Conta que vai receber o SOL (ex: treasury)
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,
}

#[derive(Accounts)]
pub struct PassAdd<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::UnregisteredUser
    )]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: Conta que vai receber o SOL (ex: treasury)
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PassRemove<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::UnregisteredUser
    )]
    pub user: Account<'info, User>, // Guarda pass_balance

    #[account(mut)]
    pub signer: Signer<'info>, // quem está pedindo o saque

    /// CHECK: Conta que vai receber o SOL (ex: treasury)
    #[account(mut)]
    pub vault_account: Account<'info, TokenAccount>,

    pub token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

#[event]
pub struct BalanceGasEvent {
    pub user: Pubkey,
    pub balance: u64,
    pub value: u64,
    pub increase: bool,
    pub is_operation: bool,
}

#[event]
pub struct BalancePassEvent {
    pub user: Pubkey,
    pub balance: u64,
    pub value: u64,
    pub increase: bool,
    pub is_operation: bool,
}

#[derive(Accounts)]
pub struct RebalancePosition<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,

    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub lp_token: Account<'info, Mint>,

    #[account(mut)]
    pub user_lp_token_account: Account<'info, TokenAccount>,

    /// CHECK: Apenas para seeds
    pub mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(strategy_token: Pubkey, decimals: u8)]
pub struct LiquidityAdd<'info> {
    pub bot: Account<'info, Bot>,
    pub user: Account<'info, User>,
    pub strategy_list: Account<'info, StrategyList>,
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = coin,
        associated_token::authority = sub_account
    )]
    pub vault_account: Account<'info, TokenAccount>,

    pub coin: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        seeds = [b"lp_token", sub_account.key().as_ref(), strategy_token.as_ref(), coin.key().as_ref()],
        bump,
        mint::decimals = decimals,
        mint::authority = signer.key(),
        mint::freeze_authority = signer.key()
    )]
    pub lp_token: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = lp_token,
        associated_token::authority = signer
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}