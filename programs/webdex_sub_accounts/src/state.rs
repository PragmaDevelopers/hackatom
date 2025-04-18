use anchor_lang::prelude::*;
use shared_factory::state::*;
use shared_factory::ID as FACTORY_ID;
use shared_sub_accounts::state::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct CreateSubAccount<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,

    #[account(
        init_if_needed,
        payer = owner,
        space = SubAccountList::SPACE,
        seeds = [b"sub_account_list", bot.key().as_ref(), user.key().as_ref()],
        bump
    )]
    pub sub_account_list: Account<'info, SubAccountList>,

    #[account(
        init,
        payer = owner,
        space = SubAccount::SPACE,
        seeds = [b"sub_account", bot.key().as_ref(), user.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub sub_account: Account<'info, SubAccount>,

    /// quem é dono do bot e pagador
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: usuário que vai criar a subconta
    pub user: AccountInfo<'info>,

    /// CHECK: 
    pub contract_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetSubAccounts<'info> {
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
pub struct FindSubAccountIndex<'info> {
    pub sub_account_list: Account<'info, SubAccountList>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct AddLiquidity<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID, // ← ISSO É O QUE FALTA GERALMENTE
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        init_if_needed,
        payer = owner,
        space = StrategyBalanceList::SPACE,
        seeds = [
            b"strategy_balance",
            bot.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Usuário da subconta
    pub user: AccountInfo<'info>,

    /// CHECK: 
    pub contract_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    pub sub_account: Account<'info, SubAccount>,
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
pub struct GetBalances<'info> {
    pub sub_account: Account<'info, SubAccount>,
    pub strategy_balance: Account<'info, StrategyBalanceList>,
}

#[derive(Accounts)]
pub struct GetSubAccountStrategies<'info> {
    pub sub_account: Account<'info, SubAccount>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct RemoveLiquidity<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID,
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,

    #[account(mut)]
    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            bot.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: Usuário vinculado à subconta
    pub user: AccountInfo<'info>,

    /// CHECK: Apenas usada para seed do bot
    pub contract_address: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct TogglePause<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID,
        has_one = owner
    )]
    pub bot: Account<'info, Bot>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            bot.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: usuário vinculado à subconta
    pub user: AccountInfo<'info>,

    /// CHECK: só para seed
    pub contract_address: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(account_id: String, strategy_token: Pubkey)]
pub struct PositionLiquidity<'info> {
    #[account(
        seeds = [b"bot", contract_address.key().as_ref()],
        bump,
        seeds::program = FACTORY_ID,
    )]
    pub bot: Account<'info, Bot>,

    pub sub_account: Account<'info, SubAccount>,

    #[account(
        mut,
        seeds = [
            b"strategy_balance",
            bot.key().as_ref(),
            sub_account.key().as_ref(),
            strategy_token.as_ref()
        ],
        bump
    )]
    pub strategy_balance: Account<'info, StrategyBalanceList>,

    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: Usuário da subconta
    pub user: AccountInfo<'info>,
    /// CHECK: usado para seed
    pub contract_address: AccountInfo<'info>,
    /// CHECK
    pub payments: AccountInfo<'info>,
}