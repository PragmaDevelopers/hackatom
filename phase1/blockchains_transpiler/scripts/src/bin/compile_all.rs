use std::process::{Command, exit};

fn run_tests() {
    let run_tests_status = Command::new("cargo")
        .args(&["run", "-p", "scripts", "--bin", "run_tests"])
        .status()
        .expect("Failed to execute 'cargo run -p scripts --bin run_tests'");

    if !run_tests_status.success() {
        eprintln!("run_tests failed with exit code: {}", run_tests_status);
        exit(1);
    }
    
}

fn main() {
    run_tests();
    println!("Compiling CLI binary crate...");
    let cli_status = Command::new("cargo")
        .args(&["build", "-p", "cli", "--bin", "cli_bin"])
        .status()
        .expect("Failed to execute 'cargo build -p cli --bin cli_bin'");

    if !cli_status.success() {
        eprintln!("CLI binary crate compilation failed.");
        exit(1);
    }

    println!("Compiling API binary crate...");
    let api_status = Command::new("cargo")
        .args(&["build", "-p", "api", "--bin", "api_bin"])
        .status()
        .expect("Failed to execute 'cargo build -p api --bin api_bin'");

    if !api_status.success() {
        eprintln!("API binary crate compilation failed.");
        exit(1);
    }

    println!("Both CLI and API binary crates compiled successfully.");
}
