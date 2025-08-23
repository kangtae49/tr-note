use std::env;
use std::io::Write;
use std::path::{PathBuf};
use crate::err::{ApiResult, ApiError};

#[tauri::command]
#[specta::specta]
pub fn get_resource_path() -> ApiResult<PathBuf> {
    if tauri::is_dev() {
        let current_path = env::current_dir()?;
        Ok(current_path.join("resources"))
    } else {
        let current_path = env::current_exe()?;
        let base_path = current_path
            .parent()
            .ok_or(ApiError::Error("err parent".to_string()))?;
        Ok(base_path.join("resources"))
    }
}





#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_get_resource_path() {
        let path = get_resource_path().unwrap();
        println!("{:?}", path);
        assert!(path.exists());
    }
}