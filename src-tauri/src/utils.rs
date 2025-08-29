use std::path::{PathBuf};
use mime_guess::from_path;
use tauri::Manager;
use tokio::io::AsyncReadExt;
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


pub async fn infer_path(path_str: &str) -> ApiResult<()> {
    let path = PathBuf::from(path_str);

    let file = tokio::fs::File::open(&path).await?;
    let mut reader = tokio::io::BufReader::new(file);

    let mut sample = vec![0u8; 16 * 1024];
    let n = reader.read(&mut sample).await?;
    sample.truncate(n);

    let mime_type = match infer::get(&sample) {
        Some(infer_type) => infer_type.mime_type().to_string(),
        None => from_path(path_str).first_or_octet_stream().to_string()
    };
    println!("mime_type: {}", mime_type);
    Ok(())
}


#[cfg(test)]
mod tests {
    use tokio;
    use super::*;
    #[tokio::test]
    async fn test_infer() {
        // let _ = infer_path("C:/sources/notes/.git/index").await;
        // let _ = infer_path("C:/sources/notes/.git/HEAD").await;
        // let _ = infer_path("C:/sources/notes/.git/objects/0a/64d417e15ac8a081959c03d9f3bb847cf6a6ea").await; // 226
        // let _ = infer_path("C:/sources/notes/.git/objects/5f/88c1457b96108b50746f4fdf391c545166caed").await; // 1175
        // let _ = infer_path("C:/sources/input.tsv").await; // 1175
        // let _ = infer_path("C:/sources/input2.tsv").await; // 1175
        // let _ = infer_path("C:/sources/ui2/tauri-app.exe").await; // application/vnd.microsoft.portable-executable
        // let _ = infer_path("C:/sources/ui2/build/viewer/base_library.zip").await; // application/vnd.microsoft.portable-executable
        // let _ = infer_path("C:/sources/ui2/build/viewer/warn-viewer.txt").await; // application/vnd.microsoft.portable-executable
        let _ = infer_path("C:/sources/py_src/py-contextmenu/.git/FETCH_HEAD").await; // application/vnd.microsoft.portable-executable

    }
}