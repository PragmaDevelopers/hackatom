use anchor_lang::prelude::*;
use webdex_common::factory::*;
use webdex_common::payments::*;
use webdex_common::strategy::*;
use webdex_common::error::ErrorCode;

#[derive(Accounts)]
pub struct AddBotAndFeeTiers<'info> {
    // Conta para Bot, criada com init
    #[account(init, payer = user, space = 1024)]
    pub bot: Account<'info, Bot>,
    
    // Conta para Payments, que já deve existir e ser mutável
    #[account(mut)]
    pub payments: Box<Account<'info, Payments>>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateBot<'info> {
    #[account(mut, has_one = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct RemoveBot<'info> {
    #[account(mut, has_one = owner, close = owner)]
    pub bot: Account<'info, Bot>,
    pub owner: Signer<'info>,
}

declare_id!("5RZ5WphwNXyqgkfBQExGNCEEUTjCTKnDkm4KqQzeavq1");

#[cfg(feature = "use_global_allocator")]
#[program]
pub mod webdex_factory {

    use super::*;

    pub fn add_bot_fee_tiers(
        ctx: Context<AddBotAndFeeTiers>,
        name: String,
        prefix: String,
        owner: Pubkey,
        manager_address: Pubkey,
        strategy_address: Pubkey,
        sub_account_address: Pubkey,
        payments_address: Pubkey,
        token_pass_address: Pubkey,
        new_fee_tiers: Vec<FeeTier>,
        
    ) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        if bot.manager_address != Pubkey::default() {
            return Err(ErrorCode::BotAlreadyRegistered.into());
        }
        bot.name = name;
        bot.prefix = prefix;
        bot.owner = owner;
        bot.manager_address = manager_address;
        bot.strategy_address = strategy_address;
        bot.sub_account_address = sub_account_address;
        bot.payments_address = payments_address;
        bot.token_pass_address = token_pass_address;

        let payments = &mut ctx.accounts.payments;
        payments.fee_tiers.extend(new_fee_tiers);
        Ok(())
    }

    pub fn get_bot_info(ctx: Context<GetBotInfo>, manager_address: Pubkey) -> Result<Bot> {
        factory::_get_bot_info(ctx,manager_address)
    }

    pub fn update_bot(
        ctx: Context<UpdateBot>,
        strategy_address: Option<Pubkey>,
        sub_account_address: Option<Pubkey>,
        payments_address: Option<Pubkey>,
    ) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        if bot.manager_address == Pubkey::default() {
            return Err(ErrorCode::BotNotFound.into());
        }
        if let Some(addr) = strategy_address {
            bot.strategy_address = addr;
        }
        if let Some(addr) = sub_account_address {
            bot.sub_account_address = addr;
        }
        if let Some(addr) = payments_address {
            bot.payments_address = addr;
        }
        Ok(())
    }

    pub fn remove_bot(ctx: Context<RemoveBot>) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        if bot.manager_address == Pubkey::default() {
            return Err(ErrorCode::BotNotFound.into());
        }
        bot.owner = Pubkey::default(); // Marca como deletado
        Ok(())
    }

    pub fn currency_allow(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        // Preparando os dados para a chamada CPI
        Payments::revoke_or_allow_currency(
            ctx,
            coin,             
            true,
        )
    }

    pub fn currency_revoke(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
    ) -> Result<()> {
        // Preparando os dados para a chamada CPI
        Payments::revoke_or_allow_currency(
            ctx,
            coin,             
            false,
        )
    }

    pub fn add_strategy(ctx: Context<AddStrategy>, name: String, contract_address: Pubkey) -> Result<()> {
        strategy::_add_strategy(ctx,name,contract_address)
    }

    pub fn update_strategy_status(ctx: Context<UpdateStrategyStatus>, contract_address: Pubkey, token_address: Pubkey, is_active: bool) -> Result<()> {
        strategy::_update_strategy_status(ctx,contract_address,token_address,is_active)
    }
}