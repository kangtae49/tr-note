use serde::{Deserialize, Serialize};
use specta::Type;
use thiserror::Error;

pub type ApiResult<T> = Result<T, ApiError>;
#[derive(Type, Serialize, Deserialize, Error, Debug)]
pub enum ApiError {
    #[error("Api error: {0}")]
    Error(String),

    #[error("Tauri error: {0}")]
    TauriError(String),

    #[error("IO error: {0}")]
    IoError(String),

    #[error("JSON error: {0}")]
    JsonError(String),

    #[error("Tokio error: {0}")]
    TokioError(String),

    #[error("Glob error: {0}")]
    GlobError(String),

    #[error("windows::core::Error: {0}")]
    WindowsError(String),

}

impl From<tauri::Error> for ApiError {
    fn from(e: tauri::Error) -> Self {
        ApiError::TauriError(e.to_string())
    }
}

impl From<std::io::Error> for ApiError {
    fn from(e: std::io::Error) -> Self {
        ApiError::IoError(e.to_string())
    }
}

impl From<serde_json::error::Error> for ApiError {
    fn from(e: serde_json::error::Error) -> Self {
        ApiError::JsonError(e.to_string())
    }
}

impl From<std::string::FromUtf8Error> for ApiError {
    fn from(e: std::string::FromUtf8Error) -> Self {
        ApiError::IoError(e.to_string())
    }
}

impl From<tokio::sync::oneshot::error::RecvError> for ApiError {
    fn from(e: tokio::sync::oneshot::error::RecvError) -> Self {
        ApiError::TokioError(e.to_string())
    }
}

impl From<windows::core::Error> for ApiError {
    fn from(e: windows::core::Error) -> Self {
        ApiError::WindowsError(e.to_string())
    }
}

impl From<trash::Error> for ApiError {
    fn from(e: trash::Error) -> Self {
        ApiError::IoError(e.to_string())
    }
}


