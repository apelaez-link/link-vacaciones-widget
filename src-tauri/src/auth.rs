use security_framework::passwords::{
    delete_generic_password, get_generic_password, set_generic_password,
};

const SERVICE: &str = "link.smartcity.fichajes";
const ACCOUNT: &str = "session-token";

pub fn save_token(token: &str) -> Result<(), String> {
    set_generic_password(SERVICE, ACCOUNT, token.as_bytes())
        .map_err(|e| e.to_string())
}

pub fn load_token() -> Result<Option<String>, String> {
    match get_generic_password(SERVICE, ACCOUNT) {
        Ok(bytes) => String::from_utf8(bytes)
            .map(Some)
            .map_err(|e| e.to_string()),
        Err(e) if e.code() == -25300 => Ok(None), // errSecItemNotFound
        Err(e) => Err(e.to_string()),
    }
}

pub fn delete_token() -> Result<(), String> {
    match delete_generic_password(SERVICE, ACCOUNT) {
        Ok(()) => Ok(()),
        Err(e) if e.code() == -25300 => Ok(()), // already gone
        Err(e) => Err(e.to_string()),
    }
}
