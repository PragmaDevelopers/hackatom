/*use anchor_lang::prelude::*;
use serde::{Deserialize, Serialize};
use webdex_common::factory::*;
use webdex_common::sub_account::*;
use webdex_common::error::ErrorCode;

#[account]
pub struct User {
    pub manager: Pubkey,
    pub gas_balance: [u8; 32],
    pub pass_balance: [u8; 32],
    pub status: bool,
}

impl User {
    pub const LEN: usize = 32   // manager: Pubkey
        + 32                   // gas_balance: [u8; 32]
        + 32                   // pass_balance: [u8; 32]
        + 1;                   // status: bool
}

#[account]
pub struct UserDisplay {
    pub manager: Pubkey,
    pub gas_balance: [u8; 32],
    pub pass_balance: [u8; 32],
    pub sub_accounts: Vec<SubAccountsDisplay>,
}

#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone, Default)]
pub struct Coin {
    pub status: bool,
    // Armazenamos apenas o Pubkey da conta mint do LPToken
    pub lp_token_mint: Pubkey,
}

#[derive(Accounts)]
pub struct InitializeLpToken<'info> {
    #[account(
        init,
        payer = signer,
        mint::decimals = 0,
        mint::authority = signer
    )]
    pub lp_token_mint: Account<'info, Mint>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Contexto para a função register
#[derive(Accounts)]
pub struct RegisterAndCreateSubAccount<'info> {
    // Conta do usuário que será criada (registro)
    #[account(init, payer = payer, space = 8 + User::LEN)]
    pub user: Account<'info, User>,

    // Se o manager for fornecido, deve ser uma conta existente do User
    // Para simplificar, exigimos que seja sempre passado; se não houver, pode ser passado Pubkey::default()
    #[account(mut)]
    pub manager_user: Account<'info, User>,

    #[account(init, payer = user, space = 8 + SubAccount::LEN)]
    pub subaccount: Account<'info, SubAccount>,
    // Conta que mantém um contador para gerar IDs únicos para as subcontas
    #[account(mut)]
    pub id_generator: Account<'info, IDGenerator>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

// Uma conta simples para gerar IDs únicos
#[account]
pub struct IDGenerator {
    pub counter: u64,
}

impl IDGenerator {
    pub const LEN: usize = 8; // Apenas um u64
}

// Evento de registro
#[event]
pub struct RegisterEvent {
    pub user: Pubkey,
    pub manager: Pubkey,
}

declare_id!("6RuoSrSkzbTyMTdVzXp1xn2gyH4h9FtdZ8iQa12jmZqp");

#[cfg(feature = "use_global_allocator")]
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

    pub fn get_sub_account_address(ctx: Context<GetBotInfo>) -> Result<Pubkey> {
        // Retorna o Pubkey da subconta armazenado na conta do bot
        Ok(ctx.accounts.bot.sub_account_address)
    }
}*/