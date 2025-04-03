#[cfg(feature = "error")]
pub mod error;
#[cfg(feature = "factory")]
pub mod factory;
#[cfg(feature = "manager")]
pub mod manager;
#[cfg(feature = "payments")]
pub mod payments;
#[cfg(feature = "strategy")]
pub mod strategy;
#[cfg(feature = "sub_account")]
pub mod sub_account;

use anchor_lang::declare_id;

declare_id!("C9jYWL7cKmsfqtFwJgf6BzA1wjcUy9HU6o6oMDEkFAGi");