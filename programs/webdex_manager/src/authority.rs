use anchor_lang::prelude::*;

// QUEM PODE SE REGISTRAR COMO MANAGER
pub fn _get_authorized_managers() -> Vec<Pubkey> {
    vec![
        pubkey!("5jYrTguQ1qh2KXpbEowMYuXg58paHt1F7CaH9E7mjdqu"),
    ]
}