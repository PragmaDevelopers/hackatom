use anchor_lang::prelude::*;
use webdex_common::factory::*;
use webdex_common::manager::*;
use webdex_common::error::ErrorCode;

declare_id!("6RuoSrSkzbTyMTdVzXp1xn2gyH4h9FtdZ8iQa12jmZqp");

#[program]
pub mod webdex_manager {

    use super::*;

    pub fn register(ctx: Context<RegisterAndCreateSubAccount>, manager: Pubkey, name: String) -> Result<()> {
        // Se um gerente foi fornecido (diferente de Pubkey::default()), 
        // verifica se a conta do gerente está registrada (status == true)
        if manager != Pubkey::default() {
            require!(ctx.accounts.manager_user.status, ErrorCode::UnregisteredManager);
        }

        // Verifica se o usuário (a ser criado) não está registrado.
        // Como estamos utilizando `#[account(init, ...)]`, a conta não deve existir ainda.
        // Se fosse uma conta já existente, poderíamos verificar o campo status.
        let user_account = &mut ctx.accounts.user;
        require!(!user_account.status, ErrorCode::UserAlreadyRegistered);

        // Inicializa a conta do usuário com os dados
        user_account.manager = manager;
        user_account.gas_balance = [0u8; 32];
        user_account.pass_balance = [0u8; 32];
        user_account.status = true;

        // Emite o evento de registro
        emit!(RegisterEvent {
            user: user_account.key(),
            manager,
        });

        // Chama a função interna para criar uma subconta para o usuário
        let subaccount = &mut ctx.accounts.subaccount;
        subaccount.owner = ctx.accounts.user.key();
        subaccount.name = name.clone();
        subaccount.id = ctx.accounts.id_generator.counter;
        // Incrementa o contador para gerar IDs únicos
        ctx.accounts.id_generator.counter += 1;
        Ok(())
    }

    pub fn get_sub_account(ctx: Context<GetBotInfo>) -> Result<Pubkey> {
        // Retorna o Pubkey da subconta armazenado na conta do bot
        Ok(ctx.accounts.bot.sub_account_address)
    }
}
