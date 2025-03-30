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
    let status = Command::new("cargo")
        .args(&["build", "-p", "api", "--bin", "api_bin"])
        .status()
        .expect("Failed to execute 'cargo build -p api --bin api_bin'");

    if !status.success() {
        eprintln!("API binary crate compilation failed.");
        exit(1);
    }
}
