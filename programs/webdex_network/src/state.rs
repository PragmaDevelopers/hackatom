use anchor_lang::prelude::*;
use anchor_spl::token::{Token,TokenAccount,Mint};
use anchor_spl::associated_token::AssociatedToken;
use shared_factory::state::{Bot};
use shared_manager::state::{User};
use webdex_sub_accounts::state::{SubAccount};
use shared_factory::authority::{
    _fixed_fee_collector_network,
    _fixed_void_collector_1,
    _fixed_void_collector_2,
    _fixed_void_collector_3,
    _fixed_void_collector_4
};

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
    pub bot: Account<'info, Bot>,
    
    pub user: Account<'info, User>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + std::mem::size_of::<BalanceInfo>(),
        seeds = [b"balance_info", contract_address.key().as_ref(), user.key().as_ref(), token_mint.key().as_ref()],
        bump
    )]
    pub balance_info: Account<'info, BalanceInfo>,

    /// CHECK: Apenas para seeds
    pub token_mint: Account<'info, Mint>,

    /// CHECK: Apenas para seeds
    pub contract_address: AccountInfo<'info>,

    #[account(mut)]
    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdrawal<'info> {
    #[account(mut)]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(mut)]
    pub balance_info: Account<'info, BalanceInfo>,

    /// CHECK: Apenas para seeds
    pub token_mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = signer,
    )]
    pub user_token_account: Account<'info, TokenAccount>, // do SPL depositado

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = sub_account_authority,
    )]
    pub vault_token_account: Account<'info, TokenAccount>, // onde o token vai

    #[account(
        seeds = [b"sub_account",sub_account.key().as_ref()],
        bump
    )]
    /// CHECK: É usado como signer programático
    pub sub_account_authority: AccountInfo<'info>,

    /// CHECK: Autoridade fixa do collector network
    #[account(address = _fixed_fee_collector_network())]
    pub fee_collector_network_address: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = fee_collector_network_address,
    )]
    pub fee_collector_network_account: Account<'info, TokenAccount>,

    /// CHECK: Autoridade fixa do collector 1
    #[account(address = _fixed_void_collector_1())]
    pub void_collector_1: AccountInfo<'info>,
    /// CHECK: Autoridade fixa do collector 2
    #[account(address = _fixed_void_collector_2())]
    pub void_collector_2: AccountInfo<'info>,
    /// CHECK: Autoridade fixa do collector 3
    #[account(address = _fixed_void_collector_3())]
    pub void_collector_3: AccountInfo<'info>,
    /// CHECK: Autoridade fixa do collector 4
    #[account(address = _fixed_void_collector_4())]
    pub void_collector_4: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = void_collector_1
    )]
    pub void_collector_1_lp_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = void_collector_2
    )]
    pub void_collector_2_lp_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = void_collector_3
    )]
    pub void_collector_3_lp_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = token_mint,
        associated_token::authority = void_collector_4
    )]
    pub void_collector_4_lp_account: Box<Account<'info, TokenAccount>>,

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