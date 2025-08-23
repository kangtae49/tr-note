use std::env;
use std::io::Write;
use std::path::{PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};
use filetime::FileTime;
use crate::dir_api::{get_file_item, Item, MetaType};
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


#[tauri::command]
#[specta::specta]
pub async fn save_file(file_path: &str, text: &str) -> ApiResult<Item> {
    let file_path_buf = PathBuf::from(file_path);
    let mut file = std::fs::File::create(&file_path_buf)?;
    file.write_all(text.as_bytes())?;
    file.flush()?;
    println!("save_file file_path {:?}", file_path);
    let item = get_file_item(file_path, &vec![MetaType::Sz, MetaType::Tm, MetaType::Mt, MetaType::Ext])?;
    println!("{:?}", item);
    if let Some(parent) = file_path_buf.parent() {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap();
        let ft = FileTime::from_unix_time(now.as_secs() as i64, now.subsec_nanos());
        filetime::set_file_mtime(parent, ft)?;
    }
    Ok(item)
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