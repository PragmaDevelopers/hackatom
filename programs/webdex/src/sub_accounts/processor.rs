use anchor_lang::prelude::*;
use crate::sub_accounts::state::{CreateSubAccount,SubAccountInfo,CreateSubAccountEvent,GetSubAccounts};
use crate::error::ErrorCode;

pub fn _create_sub_account(ctx: Context<CreateSubAccount>, name: String) -> Result<()> {
    let bot = &ctx.accounts.bot;
    let sub_account_list = &mut ctx.accounts.sub_account_list;
    let sub_account = &mut ctx.accounts.sub_account;
    let owner = &ctx.accounts.owner;
    let user = &ctx.accounts.user;

    // ✅ Verifica que quem está chamando é o dono do bot
    if bot.owner != owner.key() {
        return Err(ErrorCode::Unauthorized.into());
    }

    // ✅ Garante que o contrato da lista pertence ao mesmo bot
    if sub_account_list.contract_address == Pubkey::default() {
        sub_account_list.contract_address = bot.contract_address;
    } else if sub_account_list.contract_address != bot.contract_address {
        return Err(ErrorCode::InvalidContractAddress.into());
    }

    // ✅ Limite máximo de subcontas
    let sub_account_count = sub_account_list.sub_accounts.len();
    if sub_account_count >= 50 {
        return Err(ErrorCode::MaxSubAccountsReached.into());
    }

    // ✅ Converte para u8 com verificação segura
    let index_byte = u8::try_from(sub_account_count)
        .map_err(|_| ErrorCode::MaxSubAccountsReached)?;

    // ✅ Gera o PDA de forma determinística
    let (sub_account_id, _bump) = Pubkey::find_program_address(
        &[
            b"sub_account_id",
            bot.key().as_ref(),
            user.key().as_ref(),
            name.as_bytes(),
            &[index_byte],
        ],
        ctx.program_id,
    );

    // ✅ Inicializa a subconta
    sub_account.id = sub_account_id.to_string();
    sub_account.name = name.clone();
    sub_account.list_strategies = Vec::new();
    sub_account.strategies = Vec::new();

    // ✅ Atualiza a lista de subcontas
    let sub_account_pda = sub_account.key();
    sub_account_list.sub_accounts.push(sub_account_pda);

    // ✅ Emite o evento
    emit!(CreateSubAccountEvent {
        owner: owner.key(),
        user: user.key(),
        id: sub_account_id.to_string(),
        name,
    });

    Ok(())
}

/*pub fn get_sub_accounts(ctx: Context<GetSubAccounts>) -> Result<Vec<SubAccountInfo>> {
    let sub_account_list = &ctx.accounts.sub_account_list;
    Ok(sub_account_list.sub_accounts.clone())
}*/