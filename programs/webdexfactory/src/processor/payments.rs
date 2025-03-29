use anchor_lang::prelude::*;
use crate::state::payments::{
    AddFeeTiers, FeeTier, PaymentsBot, RevokeOrAllowCurrency
};

#[error_code]
pub enum ErrorCode {
    #[msg("A moeda especificada não foi encontrada.")]
    CoinNotFound
}

impl PaymentsBot {
    fn update_coin_status(&mut self, coin_address: Pubkey, status: bool) -> Result<()> {
        if let Some(coin) = self.coins.iter_mut().find(|(pubkey, _)| *pubkey == coin_address) {
            coin.1.status = status;  // Atualiza o status da moeda (coin.1 é a estrutura Coins)
            Ok(())
        } else {
            Err(ErrorCode::CoinNotFound.into())
        }
    }

    pub fn revoke_or_allow_currency(
        ctx: Context<RevokeOrAllowCurrency>,
        coin: Pubkey,
        status: bool,
    ) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        bot.update_coin_status(coin, status)?;
        Ok(())
    }

    pub fn add_fee_tiers(ctx: Context<AddFeeTiers>, new_fee_tiers: Vec<FeeTier>) -> Result<()> {
        let bot = &mut ctx.accounts.bot;
        bot.fee_tiers.extend(new_fee_tiers);
        Ok(())
    }
}