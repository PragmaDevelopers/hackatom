use anchor_lang::prelude::*;
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

impl BalanceStrategy {
    pub const MAX_ICO_LEN: usize = 64; // Defina o comprimento máximo esperado para 'ico'
    pub const MAX_NAME_LEN: usize = 64; // Defina o comprimento máximo esperado para 'name'

    pub const SPACE: usize = 32 // amount
        + 32 // token
        + 32 // decimals
        + 4 + Self::MAX_ICO_LEN // ico
        + 4 + Self::MAX_NAME_LEN // name
        + 1 // status
        + 1; // paused
}

#[account]
pub struct StrategyBalance {
    pub status: bool,
    pub list_coins: Vec<Pubkey>,
    pub balance: Vec<BalanceStrategy>,
}

impl StrategyBalance {
    pub const MAX_LIST_COINS: usize = 10; // Número máximo de 'list_coins'
    pub const MAX_BALANCES: usize = 10; // Número máximo de 'balance'

    pub const SPACE: usize = 1 // status
        + 4 + (Self::MAX_LIST_COINS * 32) // list_coins
        + 4 + (Self::MAX_BALANCES * BalanceStrategy::SPACE); // balance
}

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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SubAccountInfo {
    pub name: String,
    pub id: String,
}

#[account]
pub struct SubAccountList {
    pub manager: Pubkey,
    pub sub_accounts: Vec<SimpleSubAccountInformation>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SimpleSubAccountInformation {
    pub id: String,
    pub name: String,
}

#[account]
pub struct ComplexSubAccountInformation {
    pub id: String,
    pub name: String,
    pub list_strategies: Vec<Pubkey>,
    pub strategies: Vec<StrategyBalance>,
}

impl ComplexSubAccountInformation {
    pub const MAX_ID_LEN: usize = 64; // Defina o comprimento máximo esperado para 'id'
    pub const MAX_STRATEGIES: usize = 10; // Número máximo de estratégias
    pub const MAX_LIST_STRATEGIES: usize = 10; // Número máximo de 'list_strategies'

    pub const SPACE: usize = 8 // Discriminador
        + 4 + Self::MAX_ID_LEN // id
        + 4 + (Self::MAX_LIST_STRATEGIES * 32) // list_strategies
        + 4 + (Self::MAX_STRATEGIES * StrategyBalance::SPACE); // strategies
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    #[account(mut)]
    pub manager: Signer<'info>,
    pub user: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"sub_account_list", manager.key().as_ref()],
        bump,
        has_one = manager,
    )]
    pub sub_account_list: Account<'info, SubAccountList>,
    #[account(
        init,
        payer = manager,
        space = ComplexSubAccountInformation::SPACE,
        seeds = [b"complex_sub_account", manager.key().as_ref(), name.as_bytes()],
        bump,
    )]
    pub complex_sub_account: Account<'info, ComplexSubAccountInformation>,
    pub bot: Account<'info, Bot>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccounts<'info> {
    pub manager: Signer<'info>,
    #[account(
        seeds = [b"sub_account_list", manager.key().as_ref()],
        bump,
    )]
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
#[instruction(account_id: String)]
pub struct GetBalance<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        seeds = [b"complex_sub_account", user.key().as_ref(), account_id.as_bytes()],
        bump,
    )]
    pub complex_sub_account: Account<'info, ComplexSubAccountInformation>,
}

#[event]
pub struct CreateSubAccountEvent {
    pub manager: Pubkey,
    pub user: Pubkey,
    pub id: String,
    pub name: String,
}

pub fn create_sub_account(ctx: &mut Context<CreateSubAccount>, name: String) -> Result<()> {
    let sub_account_list = &mut ctx.accounts.sub_account_list;
    let complex_sub_account = &mut ctx.accounts.complex_sub_account;
    let manager = &ctx.accounts.manager;
    let user = &ctx.accounts.user;
    let bot = &ctx.accounts.bot;

    // Verifica se o manager_address na conta Bot corresponde ao manager atual
    require!(
        bot.manager_address == manager.key(),
        ErrorCode::UnauthorizedSubAccount
    );

    // Se ainda não tiver um manager, define o manager como o Signer da transação
    if sub_account_list.manager == Pubkey::default() {
        sub_account_list.manager = ctx.accounts.manager.key();
    }

    // Gerar o PDA para a subconta
    let (sub_account_pda, _bump) = Pubkey::find_program_address(
        &[b"sub_account", manager.key().as_ref(), name.as_bytes()],
        ctx.program_id,
    );

    // Inicializa a ComplexSubAccountInformation
    complex_sub_account.id = sub_account_pda.to_string();
    complex_sub_account.name = name.clone();
    complex_sub_account.list_strategies = Vec::new();
    complex_sub_account.strategies = Vec::new();

    // Adiciona a nova subconta à lista de subcontas
    let simple_info = SimpleSubAccountInformation { id: sub_account_pda.to_string(), name: name.clone() };
    sub_account_list.manager = manager.key();
    sub_account_list.sub_accounts.push(simple_info);

    emit!(CreateSubAccountEvent {
        manager: manager.key(),
        user: user.key(),
        id: sub_account_pda.to_string(),
        name,
    });

    Ok(())
}

pub fn get_sub_accounts(ctx: Context<GetSubAccounts>) -> Result<Vec<SimpleSubAccountInformation>> {
    let sub_account_list = &ctx.accounts.sub_account_list;
    Ok(sub_account_list.sub_accounts.clone())
}

pub fn get_balance(
    ctx: Context<GetBalance>,
    account_id: String,
    strategy_token: Pubkey,
    coin: Pubkey,
) -> Result<BalanceStrategy> {
    // Encontrar a subconta pelo ID
    let sub_account = &ctx.accounts.complex_sub_account;
    
    // Verificar se a estratégia está vinculada à subconta
    let strategy = sub_account.strategies.iter().find(|s| s.list_coins.contains(&strategy_token))
        .ok_or(ErrorCode::SubAccountNotFound)?;
    
    // Verificar se a moeda está vinculada à estratégia
    let balance = strategy.balance.iter().find(|b| b.token == coin)
        .ok_or(ErrorCode::AccountNotLinkedToCurrency)?;
    
    Ok(balance.clone())
}