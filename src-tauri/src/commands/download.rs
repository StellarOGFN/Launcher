use std::{ fs::{ self, File, OpenOptions }, path::Path };

pub fn download_file(url: &str, dest: &Path) -> Result<(), Box<dyn std::error::Error>> {
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut response = reqwest::blocking::get(url)?;
    if !response.status().is_success() {
        return Err(format!("failed to download file: status {}", response.status()).into());
    }
    let mut file = fs::File::create(dest)?;
    let content_length = response.content_length();

    let bytes_written = std::io::copy(&mut response, &mut file)?;
    if let Some(expected) = content_length {
        if bytes_written != expected {
            return Err(
                format!(
                    "couldn't complete download: expected {} bytes, got {} bytes",
                    expected,
                    bytes_written
                ).into()
            );
        }
    }
    Ok(())
}
