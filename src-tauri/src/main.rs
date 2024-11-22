// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ais;
mod error;

pub use self::error::{Error, Result};

fn main() {
    git_pulse_lib::run()
}
