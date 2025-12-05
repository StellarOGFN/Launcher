// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_log::log;

pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder
        ::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::new().level(tauri_plugin_log::log::LevelFilter::Info).build()
        )
        .plugin(tauri_plugin_single_instance::init(|app, args, cwd| {}))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_single_instance::init(|_app, argv, _cwd| {
                println!(
                    "a new app instance was opened with {argv:?} and the deep link event was already triggered"
                );
            })
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.deep_link().register_all()?;
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                commands::builds::search_for_version,
                commands::builds::check_file_exists_and_size,
                commands::builds::check_file_exists,
                commands::builds::launch
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
