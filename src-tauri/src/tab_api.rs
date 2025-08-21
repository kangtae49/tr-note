use std::io::Write;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;
use specta::Type;
use crate::err::ApiResult;
use crate::utils::get_resource_path;

#[skip_serializing_none]
#[derive(Type, Serialize, Deserialize, Debug, Default)]
pub struct TabJson {
    items: Vec<String>
}

#[tauri::command]
#[specta::specta]
pub async fn load_tab() -> ApiResult<TabJson> {
    let resource = get_resource_path()?;
    let tab_json_path = resource.join("tab.json");
    println!("{:?}", tab_json_path);
    if !tab_json_path.exists() {
        save_tab(TabJson::default()).await?;
    }
    let tab_json_str = std::fs::read_to_string(tab_json_path)?;
    let tab_json: TabJson = serde_json::from_str(&tab_json_str)?;
    Ok(tab_json)
}

#[tauri::command]
#[specta::specta]
pub async fn save_tab(json: TabJson) -> ApiResult<()>{
    let resource = get_resource_path()?;
    let tab_json_path = resource.join("tab.json");
    let json_str = serde_json::to_string_pretty(&json)?;
    let mut file = std::fs::File::create(tab_json_path)?;
    file.write_all(json_str.as_bytes())?;
    Ok(())
}