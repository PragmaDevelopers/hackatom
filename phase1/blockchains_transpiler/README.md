# BlockChain Transpiler

para adicionar novos modulos use:

`mkdir -pv ${sub_pasta} && cargo new ${sub_pasta}/${modulo} --${tipo}`

exemplo em Linux:

`mkdir -pv orm && cargo new orm/polygon_orm --lib`

cada modulo tem seus testes e também existe um modulo de testes de integração.

abaixo seguem os comandos de scripting para desenvolvimento e produção:

- `cargo run -p scripts --bin run_tests` -> para executar todos os testes.
- `cargo run -p scripts --bin compile_api` -> para compilar a API.
- `cargo run -p scripts --bin compile_cli` -> para compilar a CLI.
- `cargo run -p scripts --bin compile_all` -> para compilar ambas a API e a CLI.
- `cargo run -p scripts --bin dev_run_api` -> para executar a API.
- `cargo run -p scripts --bin dev_run_cli` -> para executar a CLI.

a CLI e a API são tanto binários quanto bibliotecas rust, a lógica é implementada
no arquivo `lib.rs` de ambas e apenas importada para o arquivo `main.rs` para
execução.

porque isto? desta forma podemos integrar e testar a CLI e a API de forma automatica
usando o sistemas de testes em rust.
