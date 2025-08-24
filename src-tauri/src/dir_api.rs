use std::{cmp};
use std::cmp::Ordering;
use std::collections::{BTreeSet, HashMap};
use std::ffi::OsStr;
use std::io::Write;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};
use std::path::Component::{Prefix, RootDir};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tokio;
use mime_guess::{from_path};
use moka::future::Cache;
use dirs_next;
use natord::compare;
use serde::{Deserialize, Serialize};
use serde_with::{serde_as, skip_serializing_none};
use specta::Type;
use sysinfo::Disks;
use tauri::State;
use tokio::sync::RwLock;
use windows::core::PCWSTR;
use windows::Win32::Foundation::{FILETIME, HANDLE};
use windows::Win32::Storage::FileSystem::{FindClose, FindExInfoStandard, FindExSearchNameMatch, FindFirstFileExW, FindNextFileW, FILE_ATTRIBUTE_DIRECTORY, FIND_FIRST_EX_LARGE_FETCH, WIN32_FIND_DATAW};
use trash;
use uuid::Uuid;
use crate::AppState;
use crate::err::{ApiError, ApiResult};


#[tauri::command]
#[specta::specta]
pub async fn read_folder(state: State<'_, Arc<RwLock<AppState>>>, params: OptParams) -> ApiResult<Folder> {
    let new_params = Params {
        meta_types: params.meta_types.unwrap_or(vec![MetaType::Sz, MetaType::Tm]),
        ordering: params.ordering.unwrap_or(vec![OrdItem { nm: OrderBy::Dir, asc: OrderAsc::Asc }, OrdItem { nm: OrderBy::Nm, asc: OrderAsc::Asc }]),
        is_pretty: params.is_pretty.unwrap_or(false),
        path_str: params.path_str.unwrap_or(String::from(".")),
        cache_nm: params.cache_nm,
        skip_n: params.skip_n,
        take_n: params.take_n,
    };
    let app_state = state.read().await;
    let dir_api = app_state.dir_api.clone().ok_or(ApiError::Error(String::from("Err DirApi")))?;
    let dir_api_guard = dir_api.read().await;
    dir_api_guard.get_folder(&new_params).await
}

#[tauri::command]
#[specta::specta]
pub async fn get_home_dir(state: State<'_, Arc<RwLock<AppState>>>) ->ApiResult<HashMap<HomeType, String>> {
    let app_state = state.read().await;
    let dir_api = app_state.dir_api.clone().ok_or(ApiError::Error(String::from("Err DirApi")))?;
    let dir_api_guard = dir_api.read().await;
    dir_api_guard.get_home_dir().await
}

#[tauri::command]
#[specta::specta]
pub async fn get_disks(state: State<'_, Arc<RwLock<AppState>>>) -> ApiResult<Vec<DiskInfo>> {
    let app_state = state.read().await;
    let dir_api = app_state.dir_api.clone().ok_or(ApiError::Error(String::from("Err DirApi")))?;
    let dir_api_guard = dir_api.read().await;
    dir_api_guard.get_disks().await
}


#[tauri::command]
#[specta::specta]
pub async fn save_file(state: State<'_, Arc<RwLock<AppState>>>, file_path: &str, text: &str) -> ApiResult<Item> {
    let file_path_buf = PathBuf::from(file_path);
    let mut file = std::fs::File::create(&file_path_buf)?;
    file.write_all(text.as_bytes())?;
    file.flush()?;
    println!("save_file file_path {:?}", file_path);
    let item = get_file_item(file_path, vec![MetaType::Sz, MetaType::Tm, MetaType::Mt, MetaType::Ext])?;
    println!("{:?}", item);

    let app_state = state.read().await;
    let dir_api = app_state.dir_api.clone().ok_or(ApiError::Error(String::from("Err DirApi")))?;
    let dir_api_guard = dir_api.read().await;
    dir_api_guard.remove_cache(file_path);

    Ok(item)
}

#[tauri::command]
#[specta::specta]
pub fn get_file_item(path: &str, meta_types: Vec<MetaType>) -> ApiResult<Item> {
    let path = PathBuf::from(path);
    let nm_os = path.file_name().ok_or(ApiError::Error(String::from("Err FileName")))?;
    let nm = nm_os.to_string_lossy().to_string();
    let mut ext = None;
    let mut sz = None;
    let mut tm = None;
    let mut mt = None;
    let dir = path.is_dir();
    if meta_types.contains(&MetaType::Ext) {
        ext = get_extension(&nm).map(|x| x.to_string());
    }
    if meta_types.contains(&MetaType::Sz) {
        sz = Some(path.metadata()?.len());
    }
    if meta_types.contains(&MetaType::Tm) {
        let system_time = path.metadata()?.modified()?;
        tm = Some(system_time.to_sec());
    }
    if meta_types.contains(&MetaType::Mt) {
        mt = get_mime_type(&nm);
    }
    Ok(Item {
        nm,
        dir,
        ext,
        mt,
        sz,
        tm,
        ..Item::default()
    })
}

#[tauri::command]
#[specta::specta]
pub async fn delete_path(path: &str) -> ApiResult<String> {
    let p = Path::new(path);
    trash::delete(p)?;
    Ok(path.to_string())
}

#[tauri::command]
#[specta::specta]
pub async fn rename_path(base_path: &str, old_name: &str, new_name: &str) -> ApiResult<String> {
    println!("rename_path");
    let base_path = PathBuf::from(base_path);
    let old_path = base_path.join(old_name);
    let new_path = base_path.join(new_name);
    println!("rename_path old_path {:?}", &old_path);
    println!("rename_path new_path {:?}", &new_path);
    std::fs::rename(&old_path, &new_path)?;
    Ok(new_path.to_string_lossy().into_owned())
}

#[tauri::command]
#[specta::specta]
pub async fn create_folder(base_path: &str) -> ApiResult<String> {
    let uuid = Uuid::new_v4();
    let short_id = &uuid.as_simple().to_string()[0..4];
    let name = format!("new_folder_{}", short_id);
    let new_path = Path::new(base_path).join(name);
    std::fs::create_dir(&new_path)?;
    Ok(new_path.to_string_lossy().into_owned())
}

#[tauri::command]
#[specta::specta]
pub async fn create_file(base_path: &str) -> ApiResult<String> {
    let uuid = Uuid::new_v4();
    let short_id = &uuid.as_simple().to_string()[0..4];
    let name = format!("new_file_{}.txt", short_id);
    let new_path = Path::new(base_path).join(name);
    std::fs::File::create(&new_path)?;
    Ok(new_path.to_string_lossy().into_owned())
}


#[derive(Type, Serialize, Deserialize, Clone, Eq, PartialEq, Hash, PartialOrd, Ord, Debug)]
pub enum MetaType {
    Sz,
    Tm,
    Mt,
    Ext,
}

#[derive(Type, Serialize, Deserialize, Clone, Eq, PartialEq, Hash, Debug)]
pub enum OrderBy {
    Dir,
    Nm,
    Sz,
    Tm,
    Mt,
    Ext,
}

#[derive(Type, Serialize, Deserialize, Eq, Clone, PartialEq, Hash, Debug)]
pub enum OrderAsc {
    Asc,
    Desc,
}

#[derive(Type, Serialize, Deserialize, Eq, Clone, PartialEq, Hash, Debug)]
pub enum HomeType {
    RootDir,
    HomeDir,
    DownloadDir,
    VideoDir,
    DocumentDir,
    DesktopDir,
    PictureDir,
    AudioDir,
    ConfigDir,
    DataDir,
    DataLocalDir,
    CacheDir,
    FontDir,
    PublicDir,
    ExecutableDir,
    RuntimeDir,
    TemplateDir,
}


#[derive(Type, Serialize, Deserialize, Clone, Eq, PartialEq, Hash, Debug)]
pub struct OrdItem {
    pub nm: OrderBy,
    pub asc: OrderAsc,
}

#[derive(Type, Serialize, Deserialize, Clone, Eq, PartialEq, Hash, Debug)]
pub struct DiskInfo {
    pub path: String,
}

#[derive(Clone, Eq, PartialEq, Hash)]
pub struct CacheKey {
    pub nm: String,
    pub path: String,
    pub tm: SystemTime,
    pub meta_types: BTreeSet<MetaType>,
}


#[derive(Clone)]
pub struct CacheVal {
    pub items: Vec<Item>,
    pub ordering: Vec<OrdItem>,
}

#[skip_serializing_none]
#[derive(Type, Serialize, Deserialize, Debug, Default)]
pub struct Folder {
    pub item: Item,
    pub path_param: String,
    pub base_nm: String,
    pub tot: Option<usize>,
    pub cnt: Option<usize>,
    pub skip_n: Option<usize>,
    pub take_n: Option<usize>,
    pub ordering: Option<Vec<OrdItem>>,
}


#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug, Default)]
pub struct Item {
    pub nm: String,
    pub dir: bool,
    pub ext: Option<String>,
    pub mt: Option<String>,
    pub sz: Option<u64>,  // u64
    pub tm: Option<u64>,  // u64
    pub items: Option<Vec<Item>>
}

#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug, Default)]
pub struct TextContent {
    pub path: String,
    pub mimetype: String,
    pub enc: Option<String>,
    pub text: Option<String>,
}


#[skip_serializing_none]
#[serde_as]
#[derive(Type, Serialize, Deserialize, Clone, Debug, Default)]
pub struct OptParams {
    pub path_str: Option<String>,
    pub meta_types: Option<Vec<MetaType>>,
    pub ordering: Option<Vec<OrdItem>>,
    pub skip_n: Option<usize>,
    pub take_n: Option<usize>,
    pub is_pretty: Option<bool>,
    pub cache_nm: Option<String>,
}


#[derive(Type, Serialize, Deserialize, Clone, Debug)]
pub struct Params {
    pub path_str: String,
    pub meta_types: Vec<MetaType>,
    pub ordering: Vec<OrdItem>,
    pub skip_n: Option<usize>,
    pub take_n: Option<usize>,
    pub is_pretty: bool,
    pub cache_nm: Option<String>,
}

impl Default for Params {
    fn default() -> Self {
        Params {
            path_str: String::from("."),
            meta_types: vec![MetaType::Sz, MetaType::Tm],
            ordering: vec![OrdItem {nm: OrderBy::Dir, asc: OrderAsc::Asc}, OrdItem {nm: OrderBy::Nm, asc: OrderAsc::Asc}],
            skip_n: None,
            take_n: Some(5),
            is_pretty: true,
            cache_nm: None,
        }
    }
}


pub struct DirApi {
    cache_folder: Cache<CacheKey, CacheVal>,
}

impl Default for DirApi {
    fn default() -> Self {
        DirApi {
            cache_folder: Cache::new(100),
        }
    }
}

impl DirApi {

    pub fn new() -> Self {
        DirApi {
            cache_folder: Cache::new(100),
        }
    }

    pub async fn get_folder(&self, params: &Params) -> ApiResult<Folder> {

        let Params {
            path_str,
            meta_types,
            ordering,
            skip_n,
            take_n,
            cache_nm,
            ..
        } = params.clone();
        let mut folder = Folder::default();
        let mut abs = std::path::absolute(PathBuf::from(path_str))?;
        let is_file = abs.is_file();
        if is_file {  // file -> dir
            abs.pop();
        }

        let prefix = if let Some(Prefix(prefix_component)) = abs.components().next() {
            Some(prefix_component.as_os_str().to_string_lossy().to_string())
        } else {
            None
        };
        let base_dir: String;
        let abs_parent = abs.parent().map(PathBuf::from);
        let abs_filename = match abs.file_name() {
            Some(nm) => nm.to_string_lossy().to_string(),
            None => String::from("/")
        };
        let is_parent_root = match abs.parent() {
            Some(parent) => parent.is_root(),
            None => true
        };
        if abs.is_root() || is_parent_root {
            base_dir = prefix.unwrap_or_default();
        } else {
            match abs_parent {
                Some(p) => {
                    abs = p.join(PathBuf::from(abs_filename));
                    base_dir = p.to_string_lossy().to_string();
                }
                None => return Err(ApiError::Error(String::from("Err Parent"))),
            };
        }

        let item_name = match abs.file_name() {
            Some(name) => name.to_string_lossy().to_string(),
            None => "".to_string(),
        };
        //   param        base_dir     item_name     items
        //   C://          C:            ""
        //   C://abc       C:            "abc"
        //   C://abc/def   C://abc       "def"

        folder.path_param = abs.to_string_lossy().into();
        folder.base_nm = base_dir;

        let mut item = Item::default();
        item.nm = item_name;
        item.dir = !is_file;
        let mut system_time : Option<SystemTime> = None;
        match abs.metadata() {
            Ok(meta) => {
                // system_time = meta.modified().ok();
                system_time = match meta.modified() {
                    Ok(time) => Some(time),
                    Err(e) => {
                        println!("Error Modified SystemTime: {:?} {}", abs, e);
                        None
                    }
                };
                item.tm = system_time.map(|t|t.to_sec());
            },
            Err(e) => {
                println!("Error metadata: {:?} {}", abs, e);
                item.tm = None;
            }
        }

        folder.item = item;

        let mut sorted_items: Vec<Item>;

        if let Some(cache_nm_str) = cache_nm {
            let cache_key = CacheKey {
                nm: cache_nm_str,
                path: folder.path_param.clone(),
                tm: match system_time {
                    Some(sys_tm) => sys_tm,
                    None => return Err(ApiError::Error(String::from("Err SystemTime"))),
                },
                meta_types: meta_types.clone().into_iter().collect(),
            };

            sorted_items = match self.cache_folder.get(&cache_key).await {
                Some(mut cache_val) => {
                    if cache_val.ordering != ordering  {
                        println!("sort");
                        sort_items(&mut cache_val.items, &ordering);

                        cache_val.ordering = ordering.clone();
                        cache_val = cache_val.clone();
                        self.cache_folder.insert(cache_key.clone(), cache_val.clone()).await;
                    } else {
                        println!("hit cache folder");
                    }
                    cache_val.items
                }
                None => {
                    self.remove_cache(&cache_key.path);
                    let old_keys = self.cache_folder.iter().filter(|(k, _v)| { k.path == cache_key.path });
                    for (old_key, _old_val) in old_keys {
                        let _ = self.cache_folder.remove(&old_key);
                        println!("remove old cache key");
                    }
                    println!("read folder");
                    let mut items_new = get_items_win32(abs.to_string_lossy().as_ref(), &meta_types).unwrap_or(vec![]);
                    update_items(&mut items_new, &meta_types);

                    sort_items(&mut items_new, &ordering);

                    let cache_val = CacheVal {
                        ordering: ordering.clone(),
                        items: items_new.clone(),
                    };
                    self.cache_folder.insert(cache_key.clone(), cache_val.clone()).await;
                    items_new
                }
            };
        } else {
            sorted_items = get_items_win32(abs.to_string_lossy().as_ref(), &meta_types).unwrap_or(vec![]);
            sort_items(&mut sorted_items, &ordering);

        }
        let len_items = sorted_items.len();
        let mut skip = skip_n.unwrap_or(0);
        skip = cmp::min(skip, len_items);

        let take = match take_n {
            Some(n) => cmp::min(n, len_items - skip),
            None =>  len_items - skip
        };
        let items_sliced: Vec<Item> = sorted_items.iter().skip(skip).take(take).cloned().collect();

        folder.skip_n = Some(skip);
        folder.take_n = Some(take);
        folder.ordering = Some(ordering.clone());
        folder.tot = Some(len_items);
        folder.cnt = Some(items_sliced.len());
        folder.item.items = Some(items_sliced);
        // folder.item.has = if meta_types.contains(&MetaType::Has) { Some(len_items > 0) } else { None };

        Ok(folder)
    }

    pub fn remove_cache(&self, path: &str) {
        let old_keys = self.cache_folder.iter().filter(|(k, _v)| { k.path == path });
        for (old_key, _old_val) in old_keys {
            let _ = self.cache_folder.remove(&old_key);
            println!("remove old cache key");
        }
    }

    pub async fn get_home_dir(&self) -> Result<HashMap<HomeType, String>, ApiError> {
        Ok([
            (HomeType::RootDir, Some(std::path::absolute(PathBuf::from("/"))?)),
            (HomeType::HomeDir, dirs_next::home_dir()),
            (HomeType::DownloadDir ,dirs_next::download_dir()),
            (HomeType::VideoDir ,dirs_next::video_dir()),
            (HomeType::DocumentDir ,dirs_next::document_dir()),
            (HomeType::DesktopDir ,dirs_next::desktop_dir()),
            (HomeType::PictureDir ,dirs_next::picture_dir()),
            (HomeType::AudioDir ,dirs_next::audio_dir()),
            (HomeType::ConfigDir ,dirs_next::config_dir()),
            (HomeType::DataDir ,dirs_next::data_dir()),
            (HomeType::DataLocalDir ,dirs_next::data_local_dir()),
            (HomeType::CacheDir ,dirs_next::cache_dir()),
            (HomeType::FontDir ,dirs_next::font_dir()),
            (HomeType::PublicDir ,dirs_next::public_dir()),
            (HomeType::ExecutableDir ,dirs_next::executable_dir()),
            (HomeType::RuntimeDir ,dirs_next::runtime_dir()),
            (HomeType::TemplateDir ,dirs_next::template_dir()),
        ].into_iter().filter_map(|(k, opt) | {
            opt.map(|v| (k, v.to_string_lossy().into_owned()))
        }).collect())
    }

    pub async fn get_disks(&self) -> Result<Vec<DiskInfo>, ApiError> {
        let disks = Disks::new_with_refreshed_list();
        let mut ret: Vec<DiskInfo> = vec![];
        for disk in &disks {
            let disk_info = DiskInfo {
                path: disk.mount_point().to_string_lossy().into_owned(),
            };
            ret.push(disk_info);
        }
        Ok(ret)
    }
    

}


pub struct FindHandle(HANDLE);
impl Drop for FindHandle {
    fn drop(&mut self) {
        match unsafe { FindClose(self.0) } {
            Ok(_) => { },
            Err(err) => { println!("{:?}", err) },
        }
    }
}
pub fn get_items_win32(p: &str, meta_types: &Vec<MetaType>) -> ApiResult<Vec<Item>> {
    let mut result = Vec::new();
    // let pattern = format!("{}/*", p);
    let pattern: Vec<u16> = OsStr::new(&format!("{}/*", p))
        .encode_wide()
        .chain(Some(0))
        .collect();

    let mut find_data = unsafe { std::mem::zeroed::<WIN32_FIND_DATAW>() };
    let handle = unsafe {
        FindFirstFileExW(
            PCWSTR::from_raw(pattern.as_ptr()),
            FindExInfoStandard,
            // FindExInfoBasic,
            &mut find_data as *mut _ as *mut _,
            FindExSearchNameMatch,
            None,
            FIND_FIRST_EX_LARGE_FETCH,
        )?
    };
    let _handle_guard = FindHandle(handle);
    loop {
        if let Some(item) = get_item_data_win32(&mut find_data, &meta_types) {
            result.push(item);
        }
        match unsafe { FindNextFileW(handle, &mut find_data) } {
            Ok(_handle) => {}
            Err(_error) => break,
        }
    }
    Ok(result)
}



fn get_item_data_win32(find_data: &mut WIN32_FIND_DATAW, meta_types: &Vec<MetaType>) -> Option<Item> {
    let nm = String::from_utf16_lossy(
        &find_data.cFileName[..find_data.cFileName.iter().position(|&c| c == 0).unwrap_or(0)],
    );
    if nm.is_empty() || nm == "." || nm == ".." {
        return None
    }
    let dir = (find_data.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY.0) != 0;
    let mut ext = None;
    let mut sz = None;
    let mut tm = None;

    if meta_types.contains(&MetaType::Ext) {
        ext = get_extension(&nm).map(|x| x.to_string());
    }
    if meta_types.contains(&MetaType::Sz) {
        sz = Some(((find_data.nFileSizeHigh as u64) << 32) | find_data.nFileSizeLow as u64);
    }
    if meta_types.contains(&MetaType::Tm) {
        tm = Some(filetime_to_unix_time(find_data.ftLastWriteTime));
    }

    Some(Item {
        nm,
        dir,
        ext,
        tm,
        sz,
        ..Item::default()
    })
}

fn filetime_to_unix_time(filetime: FILETIME) -> u64 {
    let high = filetime.dwHighDateTime as u64;
    let low = filetime.dwLowDateTime as u64;
    let ticks = (high << 32) | low;
    const EPOCH_DIFF: u64 = 116444736000000000;
    let unix_time_100ns = ticks.saturating_sub(EPOCH_DIFF);
    unix_time_100ns / 10_000_000
}

pub fn update_items(items: &mut Vec<Item>, meta_types: &Vec<MetaType>) {
    for item in items.iter_mut() {
        if meta_types.contains(&MetaType::Ext) {
            item.ext = get_ext(&item.nm)
        }
        if meta_types.contains(&MetaType::Mt) {
            item.mt = get_mime_type(&item.nm);
        }
    }
}

fn get_mime_type(nm: &str) -> Option<String> {
    Some(from_path(&nm).first_or_octet_stream().to_string())
}

fn get_ext(nm: &str) ->  Option<String> {
    PathBuf::from(nm).extension().map(|ext| ext.to_string_lossy().to_string().to_lowercase())
}

pub fn get_extension(filename: &str) -> Option<&str> {
    filename.rsplit_once('.').and_then(|(_, ext)| {
        if ext.is_empty() {
            None
        } else {
            Some(ext)
        }
    })
}

fn cmp_item<T: Ord>(a: &T, b: &T, asc: &OrderAsc) -> Option<Ordering> {
    if a.ne(b) {
        return if asc == &OrderAsc::Asc {
            Some(a.cmp(b))
        } else {
            Some(b.cmp(a))
        }
    }
    None
}

fn cmp_item_nat(a: &String, b: &String, asc: &OrderAsc) -> Option<Ordering> {
    if a.ne(b) {
        return if asc == &OrderAsc::Asc {
            Some(compare(a, b))
        } else {
            Some(compare(b, a))
        }
    }
    None
}

fn cmp_str_item(a: &String, b: &String, asc: &OrderAsc) -> Option<Ordering> {
    let a = a.to_lowercase();
    let b = b.to_lowercase();
    cmp_item_nat(&a, &b, asc)
}

fn cmp_opt_str_item(a: &Option<String>, b: &Option<String>, asc: &OrderAsc) -> Option<Ordering> {
    match (a, b) {
        (Some(a), Some(b)) => cmp_str_item(a, b, asc),
        _ => None
    }
}

fn cmp_opt_item<T: Ord>(a: &Option<T>, b: &Option<T>, asc: &OrderAsc) -> Option<Ordering> {
    match (a, b) {
        (Some(a), Some(b)) => cmp_item(a, b, asc),
        _ => None
    }
}


pub fn sort_items(items: &mut Vec<Item>, ordering: &Vec<OrdItem>) {
    items.sort_by(|a, b| {
        for ord in ordering.iter() {
            let res = match ord.nm {
                OrderBy::Dir => cmp_item(&b.dir, &a.dir, &ord.asc),
                OrderBy::Nm => cmp_str_item(&a.nm, &b.nm, &ord.asc),
                OrderBy::Ext if !a.dir => cmp_opt_str_item(&a.ext, &b.ext, &ord.asc),
                OrderBy::Mt if !a.dir => cmp_opt_str_item(&a.mt, &b.mt, &ord.asc),
                OrderBy::Sz if a.sz.ne(&b.sz)  => cmp_opt_item(&a.sz, &b.sz, &ord.asc),
                OrderBy::Tm if a.tm.ne(&b.tm)  => cmp_opt_item(&a.tm, &b.tm, &ord.asc),
                _ => None,
            };
            if let Some(ord) = res {
                return ord;
            }
        }
        if !ordering.iter().any(|o| o.nm == OrderBy::Nm) {
            return a.nm.cmp(&b.nm)
        }
        return Ordering::Equal
    });
}




pub trait PathExt {
    fn is_root(&self) -> bool;
    // fn has_children(&self) -> bool;
    // fn get_cnt(&self) -> Option<usize>;
}
impl PathExt for Path {
    fn is_root(&self) -> bool {
        match self.components().last() {
            Some(RootDir) => true,
            _ => false,
        }
    }

    // fn has_children(&self) -> bool {
    //     match self.read_dir() {
    //         Ok(mut entry) => {
    //             entry.next().is_some()
    //         }
    //         Err(_) => {
    //             false
    //         }
    //     }
    // }

    // fn get_cnt(&self) -> Option<usize> {
    //     match self.read_dir() {
    //         Ok(entry) => {
    //             Some(entry.count())
    //         }
    //         Err(err) => {
    //             println!("err: {:?}", err);
    //             None
    //         }
    //     }
    // }

}

pub trait SystemTimeExt {
    fn to_sec(&self) -> u64;
    // fn to_ms(&self) -> u128;
}

impl SystemTimeExt for SystemTime {
    fn to_sec(&self) -> u64 {
        match self.duration_since(UNIX_EPOCH) {
            Ok(dur) => dur.as_secs(),
            Err(_) => panic!("SystemTime before UNIX EPOCH!"),
        }
    }
    // fn to_ms(&self) -> u128 {
    //     self.duration_since(std::time::UNIX_EPOCH).unwrap().as_millis()
    // }
}



#[cfg(test)]
mod tests {
    // use crate::{models};
    use super::*;


    #[tokio::test]
    async fn test_abc() {

    }

    #[tokio::test]
    async fn test_base() {
        let api = DirApi::default();
        //   param        base_dir     item_name     items
        //   C://          C:            ""
        //   C://abc       C:            "abc"
        //   C://abc/def   C://abc       "def"

        // let x = api.dir("C://").await;
        // assert_eq!(api.dir(String::from("C://"), vec![], vec![], None, None).await.unwrap().base_dir, "C:");
        // assert_eq!(api.dir(String::from("C://"), vec![], vec![], None, None).await.unwrap().item.name, "");
        let params = Params {
            path_str: String::from(r"C://docs"),
            ..Params::default()
        };
        assert_eq!(api.get_folder(&params).await.unwrap().base_nm, "C:");
    }

    #[tokio::test]
    async fn test_permissions() {
        let api = DirApi::default();
        let params = Params {
            // path_str: String::from(r"C:\Windows\WinSxS"),
            path_str: String::from(r"C:\"),
            ..Params::default()
        };
        assert!(api.get_folder(&params).await.is_ok());
        // assert!(api.dir(String::from("C://"), vec![], vec![], None, None).await.is_ok());

    }


    #[tokio::test]
    async fn test_dir() {
        let api = DirApi::default();
        let params = Params {
            // path_str: String::from(r"C:\Windows\WinSxS"),
            path_str: String::from(r"C:\"),
            ..Params::default()
        };
        assert!(api.get_folder(&params).await.is_ok());

    }

    #[tokio::test]
    async fn test_get_folder() {
        let api = DirApi::default();
        let params = Params {
            // path_str: String::from(r"C:\Windows\WinSxS"),
            path_str: String::from(r"C:\"),
            // path_str: String::from(r"kkk"),
            // is_cache: false,
            ..Params::default()
        };
        match api.get_folder(&params).await {
            Ok(res) => {
                println!("ok:  {:?}", res);
            },
            Err(err) => {
                println!("err: {:?}", err);
            },
        };
        // match api.get_folder(params.clone()).await {
        //     Ok(json) => {
        //         println!("{}", json.len());
        //     },
        //     Err(err) => {
        //         println!("err: {:?}", err);
        //     },
        // };
    }


    #[tokio::test]
    async fn test_get_disks() {
        let api = DirApi::default();
        let s = api.get_disks().await;
        println!("{:?}", s);
    }




}
