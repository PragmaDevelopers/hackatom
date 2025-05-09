use anchor_lang::prelude::*;
use webdex_strategy::state::{StrategyList};
use shared_sub_accounts::state::{BalanceStrategy};
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use webdex_sub_accounts::state::{SubAccount,StrategyBalanceList};
use webdex_payments::state::{FeeAccount};
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
        init_if_needed, 
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
        init_if_needed, 
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
    pub user: Account<'info, User>,
}

#[derive(Accounts)]
pub struct AddGas<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::RegisteredUser
    )]
    pub user: Account<'info, User>,

    /// CHECK: Apenas para seeds
    pub pol_mint: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = pol_mint,
        associated_token::authority = signer,
    )]
    pub user_pol_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = pol_mint,
        associated_token::authority = signer
    )]
    pub vault_pol_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct RemoveGas<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::RegisteredUser
    )]
    pub user: Account<'info, User>,

    /// CHECK: Apenas para seeds
    pub pol_mint: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = pol_mint,
        associated_token::authority = signer,
    )]
    pub user_pol_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        mut,
        associated_token::mint = pol_mint,
        associated_token::authority = signer
    )]
    pub vault_pol_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(mut)]
    pub signer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct PassAdd<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::RegisteredUser
    )]
    pub user: Account<'info, User>,

    /// CHECK: Apenas para seeds
    pub webdex_mint: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = webdex_mint,
        associated_token::authority = signer,
    )]
    pub user_webdex_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = webdex_mint,
        associated_token::authority = signer
    )]
    pub vault_webdex_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct PassRemove<'info> {
    #[account(
        mut,
        seeds = [b"user", signer.key().as_ref()],
        bump,
        constraint = user.status @ ErrorCode::RegisteredUser
    )]
    pub user: Account<'info, User>, // Guarda pass_balance

    /// CHECK: Apenas para seeds
    pub webdex_mint: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = webdex_mint,
        associated_token::authority = signer,
    )]
    pub user_webdex_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        mut,
        associated_token::mint = webdex_mint,
        associated_token::authority = signer
    )]
    pub vault_webdex_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(mut)]
    pub signer: Signer<'info>, // quem está pedindo o saque

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
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
#[instruction(strategy_token: Pubkey, decimals: u8)]
pub struct LiquidityAdd<'info> {
    pub bot: Account<'info, Bot>,

    pub user: Account<'info, User>,

    pub strategy_list: Account<'info,StrategyList>,

    pub sub_account: Account<'info, SubAccount>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = usdt_mint,
        associated_token::authority = signer,
    )]
    pub user_usdt_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = usdt_mint,
        associated_token::authority = sub_account_authority,
    )]
    pub vault_usdt_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(
        seeds = [b"sub_account",sub_account.key().as_ref()],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub sub_account_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        seeds = [b"lp_token",strategy_token.key().as_ref(),sub_account.key().as_ref(),usdt_mint.key().as_ref()],
        bump,
        mint::decimals = decimals,
        mint::authority = lp_mint_authority,
        mint::freeze_authority = lp_mint_authority
    )]
    pub lp_token: Account<'info, Mint>, // mint do LP

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = lp_token,
        associated_token::authority = lp_mint_authority
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>, // recebe LP tokens

    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub lp_mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(strategy_token: Pubkey, decimals: u8)]
pub struct LiquidityRemove<'info> {
    pub user: Account<'info, User>,

    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,
    
    pub strategy_list: Account<'info,StrategyList>,

    #[account(mut)]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: AccountInfo<'info>,

    #[account(
        mut,
        associated_token::mint = usdt_mint,
        associated_token::authority = signer,
    )]
    pub user_usdt_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        mut,
        associated_token::mint = usdt_mint,
        associated_token::authority = sub_account_authority,
    )]
    pub vault_usdt_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(
        seeds = [b"sub_account",sub_account.key().as_ref()],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub sub_account_authority: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"lp_token",strategy_token.key().as_ref(),sub_account.key().as_ref(),usdt_mint.key().as_ref()],
        bump,
        mint::decimals = decimals,
        mint::authority = lp_mint_authority,
        mint::freeze_authority = lp_mint_authority
    )]
    pub lp_token: Account<'info, Mint>, // mint do LP

     #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = lp_mint_authority
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>, // recebe LP tokens

    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub lp_mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: CPI calls
    pub sub_account_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
#[instruction(strategy_token: Pubkey,decimals: u8)]
pub struct RebalancePosition<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub temporary_fee_account: Account<'info, FeeAccount>,

    /// CHECK
    pub bot_owner: AccountInfo<'info>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"lp_token",strategy_token.key().as_ref(),sub_account.key().as_ref(),usdt_mint.key().as_ref()],
        bump,
        mint::decimals = decimals,
        mint::authority = lp_mint_authority,
        mint::freeze_authority = lp_mint_authority
    )]
    pub lp_token: Account<'info, Mint>, // mint do LP

    #[account(
        mut,
        associated_token::mint = lp_token,
        associated_token::authority = lp_mint_authority
    )]
    pub user_lp_token_account: Account<'info, TokenAccount>, // recebe LP tokens

    #[account(
        seeds = [b"mint_authority"],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub lp_mint_authority: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}