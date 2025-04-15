use anchor_lang::prelude::*;

pub mod factory;

pub mod payments;

pub mod strategy;

pub mod sub_accounts;

pub mod error;

pub use factory::state::*;
pub use factory::processor::*;

pub use payments::state::*;
pub use payments::processor::*;

pub use strategy::state::*;
pub use strategy::processor::*;

pub use sub_accounts::state::*;
pub use sub_accounts::processor::*;

declare_id!("8u8f1q3R3GUBsq7nD2tMRHQABQVZGzMkUypw6FKrYcnJ");

#[program]
pub mod webdex {

    use super::*;

    // FACTORY - 100%

    pub fn add_bot_fee_tiers(
        ctx: Context<AddBotAndFeeTiers>,
        name: String,
        prefix: String,
        owner: Pubkey,
        contract_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
        new_fee_tiers: Vec<FeeTier>,
    ) -> Result<()> {
        _add_bot_fee_tiers(ctx,name,prefix,owner,contract_address,strategy_address,sub_account_address,payments_address,token_pass_address,new_fee_tiers)
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, contract_address: Pubkey) -> Result<BotInfo> {
        _get_bot_info(ctx,contract_address)
    }

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        _update_bot(ctx,strategy_address,sub_account_address,payments_address)
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
       _remove_bot(ctx)
    }

    // PAYMENTS

    pub fn add_coin(
        ctx: Context<RevokeOrAllowCurrency>,
        pub_key: Pubkey,
        name: String,
        symbol: String,
        decimals: u8,
    ) -> Result<()> {
        _add_coin(ctx,pub_key,name,symbol,decimals)
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin,true)
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        _revoke_or_allow_currency(ctx,coin,false)
    }

    pub fn remove_coin(ctx: Context<RevokeOrAllowCurrency>, coin: Pubkey) -> Result<()> {
        _remove_coin(ctx,coin)
    }

    // STRATEGY - 100%

    pub fn add_strategy(
        ctx: Context<AddStrategy>,
        name: String,
        symbol: String,
        uri: String,
        contract_address: Pubkey,
    ) -> Result<()> {
        _add_strategy(ctx,name,symbol,uri,contract_address)
    }

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
        _update_strategy_status(ctx,contract_address,token_address,is_active)
    }

    pub fn get_strategies(ctx: Context<GetStrategies>, contract_address: Pubkey) -> Result<Vec<Strategy>> {
        _get_strategies(ctx,contract_address)
    }

    pub fn find_strategy(
        ctx: Context<FindStrategy>,
        contract_address: Pubkey,
        token_address: Pubkey,
    ) -> Result<Strategy> {
        _find_strategy(ctx,contract_address,token_address)
    }

    pub fn delete_strategy(
        ctx: Context<DeleteStrategy>,
        contract_address: Pubkey,
        token_address: Pubkey,
    ) -> Result<()> {
        _delete_strategy(ctx,contract_address,token_address)
    }

    // SUB ACCOUNTS

    pub fn create_sub_account(ctx: Context<CreateSubAccount>, name: String) -> Result<()> {
        _create_sub_account(ctx,name)
    }

    pub fn get_sub_accounts(
        ctx: Context<GetSubAccounts>,
        contract_address: Pubkey,
    ) -> Result<Vec<SimpleSubAccount>> {
        _get_sub_accounts(ctx, contract_address)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        account_id: String,
        strategy_token: Pubkey,
        coin: Pubkey,
        amount: u64,
        name: String,
        ico: String,
        decimals: u8,
    ) -> Result<()> {
        _add_liquidity(ctx,account_id,strategy_token,coin,amount,name,ico,decimals)
    }

    pub fn get_balance(
        ctx: Context<GetBalance>,
        account_id: String,
        strategy_token: Pubkey,
        coin: Pubkey,
    ) -> Result<BalanceStrategy> {
        _get_balance(ctx,account_id,strategy_token,coin)
    }
}