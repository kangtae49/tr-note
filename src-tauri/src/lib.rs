use std::sync::Arc;
use tauri::{Manager, Window};
use tauri_specta::{collect_commands, Builder};
use tokio::sync::{RwLock};
use crate::dir_api::DirApi;
use crate::http_server_api::{HttpServerApi};

mod err;
mod utils;
mod http_server_api;
mod dir_api;
mod tab_api;
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/


#[derive(Clone)]
struct AppState {
    pub window: Option<Window>,
    pub dir_api: Option<Arc<RwLock<DirApi>>>,
    pub http_server_api: Option<Arc<RwLock<HttpServerApi>>>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = Builder::<tauri::Wry>::new().commands(collect_commands![
        utils::get_app_dir,
        http_server_api::run_http_server,
        http_server_api::shutdown_http_server,
        dir_api::save_file,
        dir_api::read_folder,
        dir_api::get_home_dir,
        dir_api::get_disks,
        tab_api::load_tab,
        tab_api::save_tab,
    ]);

    #[cfg(debug_assertions)]
    {
        use std::path::Path;
        use std::fs::OpenOptions;
        use std::io::Write;

        use specta_typescript::BigIntExportBehavior;
        use specta_typescript::Typescript;
        use specta::TypeCollection;

        use crate::http_server_api::{HttpNotify};

        let bindings_path = Path::new("../src/bindings.ts");
        let ts = Typescript::default().bigint(BigIntExportBehavior::Number);
        builder
            .export(ts.clone(), bindings_path)
            .expect("Failed to export typescript bindings");

        let mut types = TypeCollection::default();
        types.register::<HttpNotify>();
        let http_notify_str = ts.clone().export(&types).unwrap();
        let mut file = OpenOptions::new()
            .append(true)
            .create(true)
            .open(bindings_path)
            .unwrap();
        file.write_all(http_notify_str.as_bytes()).unwrap();

    }

    tauri::Builder::default()
        .manage(Arc::new(RwLock::new(AppState {
            window: None,
            dir_api: None,
            http_server_api: None,
        })))
        .setup(move |app| {
            let window = app.get_window("main").unwrap();
            if let Some(state) = window.app_handle().try_state::<Arc<RwLock<AppState>>>() {
                let state = Arc::clone(&state);
                tauri::async_runtime::spawn(async move {
                    let mut app_state = state.write().await;
                    app_state.window = Some(window.clone());

                    let mut http_server_api = HttpServerApi::new();
                    http_server_api.set_app_state(state.clone());
                    app_state.http_server_api = Some(Arc::new(RwLock::new(http_server_api)));

                    let dir_api = DirApi::new();
                    app_state.dir_api = Some(Arc::new(RwLock::new(dir_api)));

                });
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        // .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(builder.invoke_handler())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
