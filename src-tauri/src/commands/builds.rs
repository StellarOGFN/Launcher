use std::fs::File;
use std::io::Read;
use std::path::PathBuf;
use winapi::um::winbase::CREATE_SUSPENDED;
use std::process::Stdio;
use crate::commands::download::download_file;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(not(target_os = "windows"))]
const CREATE_NO_WINDOW: u32 = 0;
#[cfg(not(target_os = "windows"))]
const CREATE_SUSPENDED: u32 = 0;

#[tauri::command]
pub async fn check_file_exists_and_size(path: &str, size: Option<u64>) -> Result<bool, String> {
    let file_path = std::path::PathBuf::from(path);
    if !file_path.exists() {
        return Ok(false);
    }

    match size {
        Some(expected_size) => {
            let actual_size = match file_path.metadata() {
                Ok(metadata) => metadata.len(),
                Err(err) => {
                    return Err(err.to_string());
                }
            };

            Ok(actual_size == expected_size)
        }
        None => Ok(true),
    }
}

#[tauri::command]
pub async fn check_file_exists(path: &str) -> Result<bool, String> {
    let file_path = std::path::PathBuf::from(path);

    if !file_path.exists() {
        return Ok(false);
    }

    Ok(true)
}

#[tauri::command]
pub fn search_for_version(path: &str) -> Result<Vec<String>, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

    let pattern = [
        0x2b, 0x00, 0x2b, 0x00, 0x46, 0x00, 0x6f, 0x00, 0x72, 0x00, 0x74, 0x00, 0x6e, 0x00, 0x69, 0x00,
        0x74, 0x00, 0x65, 0x00, 0x2b, 0x00,
    ];

    let mut matches = Vec::new();
    for (i, window) in buffer.windows(pattern.len()).enumerate() {
        if window == pattern {
            let _start = i.saturating_sub(32);
            let end = (i + pattern.len() + 64).min(buffer.len());

            let end_index = find_end(&buffer[i + pattern.len()..end]);
            if let Some(end) = end_index {
                let utf16_slice = unsafe {
                    std::slice::from_raw_parts(
                        buffer[i..i + pattern.len() + end].as_ptr() as *const u16,
                        (pattern.len() + end) / 2
                    )
                };
                let s = String::from_utf16_lossy(utf16_slice);
                matches.push(s.trim_end_matches('\0').to_string());
            }
        }
    }

    Ok(matches)
}

fn find_end(data: &[u8]) -> Option<usize> {
    let mut i = 0;
    while i + 1 < data.len() {
        if data[i] == 0 && data[i + 1] == 0 {
            return Some(i);
        }
        i += 2;
    }
    None
}

#[tauri::command]
pub fn launch(code: String, path: String) -> Result<bool, String> {
    let game_path = PathBuf::from(path);
    // let mut paks_dir = game_path.clone();
    // paks_dir.push("FortniteGame\\Content\\Paks");
    // if paks_dir.exists() && paks_dir.is_dir() {
    //     let file_count = match fs::read_dir(&paks_dir) {
    //         Ok(entries) =>
    //             entries
    //                 .filter_map(|e| e.ok())
    //                 .filter(|e| e.path().is_file())
    //                 .count(),
    //         Err(e) => {
    //             return Err(format!("Failed to read Paks directory: {}", e));
    //         }
    //     };
    //     if file_count > 56 {
    //         return Err(format!("Too many files in Paks directory ({} files found!", file_count));
    //     }
    // }

    let mut game_dll = game_path.clone();
    game_dll.push(
        "Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll"
    );

    if game_dll.exists() {
        let mut a = 0;
        let max = 50;

        loop {
            match std::fs::remove_file(&game_dll) {
                Ok(_) => {
                    break;
                }
                Err(e) => {
                    a += 1;
                    if a >= max {
                        return Err(format!("failed to remove gfsdk after {} attempts: {}", max, e));
                    }
                    if !game_dll.exists() {
                        break;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(20));
                }
            }
        }
    }

    let mut game_dll_dir = game_path.clone();
    game_dll_dir.push("Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64");

    if !game_dll_dir.exists() {
        if let Err(e) = std::fs::create_dir_all(&game_dll_dir) {
            return Err(format!("failed to create dir for gfsdk: {}", e));
        }
    }

    let mut game_dll = game_path.clone();
    game_dll.push(
        "Engine\\Binaries\\ThirdParty\\NVIDIA\\NVaftermath\\Win64\\GFSDK_Aftermath_Lib.x64.dll"
    );

    let _ = download_file(
        "https://cdn.discordapp.com/attachments/1382371810724548650/1445969103687913514/Starfall.dll?ex=6934416b&is=6932efeb&hm=9ea0a44ee701e1ba6958ba2814cbdf50cbcdbc938244bd201b9552a14798b0de&",
        &game_dll
    );

    //  let _ = std::fs::copy(r"D:\Coding\Arsenic\x64\Stellar\Arsenic.dll", &game_dll);

    let mut game_real = game_path.clone();
    game_real.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping.exe");
    let mut fnlauncher = game_path.clone();
    fnlauncher.push("FortniteGame\\Binaries\\Win64\\FortniteLauncher.exe");

    let mut fnac = game_path.clone();
    fnac.push("FortniteGame\\Binaries\\Win64\\FortniteClient-Win64-Shipping_BE.exe");

    let exchange_arg = &format!("-AUTH_PASSWORD={}", code);

    let mut fort_args = vec![
        "-epicapp=Fortnite",
        "-epicenv=Prod",
        "-epiclocale=en-us",
        "-epicportal",
        "-nobe",
        "-nouac",
        "-nocodeguards",
        "-fromfl=eac",
        "-fltoken=3db3ba5dcbd2e16703f3978d",
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQs",
        "-skippatchcheck",
        "-AUTH_LOGIN=",
        exchange_arg,
        "-AUTH_TYPE=exchangecode"
    ];

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;

        let _fort = std::process::Command
            ::new(game_real)
            .creation_flags(CREATE_NO_WINDOW)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;

        let _fnlauncherfr = std::process::Command
            ::new(fnlauncher)
            .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;

        let _ac = std::process::Command
            ::new(fnac)
            .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        let _fn = std::process::Command
            ::new(game_real)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;

        let _fnlauncherfr = std::process::Command
            ::new(fnlauncher)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;

        let _ac = std::process::Command
            ::new(fnac)
            .args(&fort_args)
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start Stellar: {}", e))?;
    }

    Ok(true)
}
