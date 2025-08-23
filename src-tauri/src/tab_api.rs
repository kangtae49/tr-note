use std::io::Write;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use specta::Type;
use tauri::Manager;
use crate::err::ApiResult;

#[skip_serializing_none]
#[derive(Type, Serialize, Deserialize, Debug, Default)]
pub struct TabItem {
    full_path: String,
    dir: bool
}

#[skip_serializing_none]
#[derive(Type, Serialize, Deserialize, Debug, Default)]
pub struct TabJson {
    items: Vec<TabItem>
}

#[tauri::command]
#[specta::specta]
pub async fn load_tab(app_handle: tauri::AppHandle) -> ApiResult<TabJson> {
    let app_dir = app_handle.path().app_data_dir()?;
    if !app_dir.exists() {
        std::fs::create_dir_all(&app_dir)?;
    }

    let tab_json_path = app_dir.join("tab.json");
    println!("{:?}", tab_json_path);
    if !tab_json_path.exists() {
        save_tab(app_handle, TabJson::default()).await?;
    }
    let tab_json_str = std::fs::read_to_string(tab_json_path)?;
    let tab_json: TabJson = serde_json::from_str(&tab_json_str)?;

    let mut new_items = Vec::new();

    for item in tab_json.items {
        let p = PathBuf::from(&item.full_path);
        if !p.exists() {
            new_items.push(item)
        } else {
            new_items.push(TabItem {
                full_path: item.full_path,
                dir: p.is_dir()
            });
        }
    }
    Ok(TabJson {
        items: new_items,
    })
}

#[tauri::command]
#[specta::specta]
pub async fn save_tab(app_handle: tauri::AppHandle, json: TabJson) -> ApiResult<()>{
    let app_dir = app_handle.path().app_data_dir()?;
    let tab_json_path = app_dir.join("tab.json");
    let json_str = serde_json::to_string_pretty(&json)?;
    let mut file = std::fs::File::create(tab_json_path)?;
    file.write_all(json_str.as_bytes())?;
    Ok(())
}