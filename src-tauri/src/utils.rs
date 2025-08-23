use std::path::{PathBuf};
use tauri::Manager;

use crate::err::{ApiResult};

// #[tauri::command]
// #[specta::specta]
// pub fn get_resource_path() -> ApiResult<PathBuf> {
//     if tauri::is_dev() {
//         let current_path = env::current_dir()?;
//         Ok(current_path.join("resources"))
//     } else {
//         let current_path = env::current_exe()?;
//         let base_path = current_path
//             .parent()
//             .ok_or(ApiError::Error("err parent".to_string()))?;
//         Ok(base_path.join("resources"))
//     }
// }

#[tauri::command]
#[specta::specta]
pub fn get_app_dir(app_handle: tauri::AppHandle) -> ApiResult<PathBuf> {
    Ok(app_handle.path().app_data_dir()?)
}





#[cfg(test)]
mod tests {
    // use super::*;
    #[test]
    fn test_get_app_dir() {
    }
}