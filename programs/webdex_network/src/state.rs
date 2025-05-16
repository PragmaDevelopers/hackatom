use anchor_lang::prelude::*;
use anchor_spl::token::{Token,TokenAccount,Mint};
use anchor_spl::associated_token::AssociatedToken;
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use webdex_sub_accounts::state::{SubAccount};

#[account]
pub struct BalanceInfo {
    pub balance: u64,
    pub token: Pubkey,
    pub user: Pubkey,
    pub contract_address: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct BalanceData {
    pub balance: u64,
}

#[event]
pub struct BalanceNetworkAdd {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub token: Pubkey,
    pub new_balance: u64,
    pub amount: u64,
}

#[event]
pub struct BalanceNetworkRemove {
    pub contract_address: Pubkey,
    pub user: Pubkey,
    pub token: Pubkey,
    pub new_balance: u64,
    pub amount: u64,
    pub fee: u64,
}

#[derive(Accounts)]
pub struct PayFee<'info> {
    pub user: Account<'info, User>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + std::mem::size_of::<BalanceInfo>(),
        seeds = [b"balance_info", contract_address.key().as_ref(), user.key().as_ref(), usdt_mint.key().as_ref()],
        bump
    )]
    pub balance_info: Account<'info, BalanceInfo>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: Account<'info, Mint>,

    /// CHECK: Apenas para seeds
    pub contract_address: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdrawal<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,

    #[account(mut)]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub balance_info: Account<'info, BalanceInfo>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = usdt_mint,
        associated_token::authority = signer,
    )]
    pub user_network_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = usdt_mint,
        associated_token::authority = fee_collector_network_address,
    )]
    pub vault_network_account: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = usdt_mint,
        associated_token::authority = fee_collector_network_address,
    )]
    pub fee_collector_network_account: Account<'info, TokenAccount>,

    #[account(mut,signer)]
    /// CHECK:
    pub fee_collector_network_address: AccountInfo<'info>,

    /// CHECK: Apenas para seeds
    pub usdt_mint: Account<'info, Mint>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    #[account()]
    pub balance_info: Account<'info, BalanceInfo>,
}