use std::env;
use std::process::{Command, exit};

/// Returns true if executing `cmd --version` succeeds.
fn command_exists(cmd: &str) -> bool {
    Command::new(cmd)
        .arg("--version")
        .output()
        .is_ok()
}

/// Change the working directory to the directory of the executable.
fn set_current_dir_to_exe_dir() {
    if let Ok(exe_path) = env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            if let Err(e) = env::set_current_dir(exe_dir) {
                eprintln!("Error setting current directory: {}", e);
                exit(1);
            }
        }
    }
}

/// Extracts package names from the JSON output of `cargo metadata`.
/// This minimal parser does not support full JSON, but it extracts the first occurrence
/// of a "name" field in each package object inside the "packages" array.
fn parse_package_names(json: &str) -> Vec<String> {
    let mut packages = Vec::new();

    // Find the start of the packages array.
    if let Some(packages_key_index) = json.find("\"packages\":") {
        // Find the '[' that begins the array.
        if let Some(array_start_rel) = json[packages_key_index..].find('[') {
            let array_start = packages_key_index + array_start_rel + 1; // position after '['
            // Now, find the matching closing ']' for the array.
            let json_bytes = json.as_bytes();
            let mut bracket_count = 1;
            let mut i = array_start;
            let array_end = loop {
                if i >= json_bytes.len() {
                    break None;
                }
                if json_bytes[i] == b'[' {
                    bracket_count += 1;
                } else if json_bytes[i] == b']' {
                    bracket_count -= 1;
                    if bracket_count == 0 {
                        break Some(i);
                    }
                }
                i += 1;
            };

            if let Some(array_end) = array_end {
                let packages_array = &json[array_start..array_end];
                let bytes = packages_array.as_bytes();
                let mut pos = 0;
                while pos < bytes.len() {
                    // Look for the start of an object.
                    if bytes[pos] == b'{' {
                        let obj_start = pos;
                        let mut brace_count = 1;
                        pos += 1;
                        while pos < bytes.len() && brace_count > 0 {
                            if bytes[pos] == b'{' {
                                brace_count += 1;
                            } else if bytes[pos] == b'}' {
                                brace_count -= 1;
                            }
                            pos += 1;
                        }
                        // Now we have an object slice.
                        let object_str = &packages_array[obj_start..pos];
                        // Look for the first occurrence of `"name":`
                        if let Some(name_index) = object_str.find("\"name\":") {
                            // After "name":, skip to the first double quote.
                            let after_name = &object_str[name_index + 7..];
                            if let Some(first_quote) = after_name.find('\"') {
                                let after_first_quote = &after_name[first_quote + 1..];
                                if let Some(second_quote) = after_first_quote.find('\"') {
                                    let name = &after_first_quote[..second_quote];
                                    packages.push(name.to_string());
                                }
                            }
                        }
                    } else {
                        pos += 1;
                    }
                }
            }
        }
    }
    packages
}

fn main() {
    // Only "cargo" is needed now because we parse the JSON ourselves.
    let required_commands = ["cargo"];

    for &cmd in &required_commands {
        if !command_exists(cmd) {
            eprintln!("Error: Required command '{}' is not installed or not in the PATH.", cmd);
            exit(1);
        }
    }

    // Change to the executable's directory.
    set_current_dir_to_exe_dir();

    // Run `cargo metadata` and capture its output.
    let output = Command::new("cargo")
        .args(&["metadata", "--format-version=1", "--no-deps"])
        .output()
        .unwrap_or_else(|e| {
            eprintln!("Failed to run cargo metadata: {}", e);
            exit(1);
        });

    if !output.status.success() {
        eprintln!("Error: cargo metadata command failed.");
        exit(1);
    }

    let metadata_json = String::from_utf8_lossy(&output.stdout);
    let packages = parse_package_names(&metadata_json);

    if packages.is_empty() {
        eprintln!("No packages found in cargo metadata output.");
        exit(1);
    }

    let mut all_passed = true;

    // Run tests for each package.
    for package in packages {
        println!("Running tests for package: {}", package);
        let status = Command::new("cargo")
            .args(&["test", "-p", &package])
            .status()
            .unwrap_or_else(|e| {
                eprintln!("Failed to run cargo test for package {}: {}", package, e);
                exit(1);
            });
        if !status.success() {
            eprintln!("Tests failed for package: {}", package);
            all_passed = false;
        }
    }

    // Run integration tests.
    println!("Running integration tests");
    let status = Command::new("cargo")
        .args(&["test", "-p", "integration_tests"])
        .status()
        .unwrap_or_else(|e| {
            eprintln!("Failed to run cargo test for integration tests: {}", e);
            exit(1);
        });
    if !status.success() {
        eprintln!("Integration tests failed");
        all_passed = false;
    }

    if all_passed {
        println!("All tests passed successfully.");
        exit(0);
    } else {
        eprintln!("Some tests failed.");
        exit(1);
    }
}
