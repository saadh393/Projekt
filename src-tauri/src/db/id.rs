use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{SystemTime, UNIX_EPOCH};

static COUNTER: AtomicU64 = AtomicU64::new(0);

const ENCODING: &[u8; 32] = b"0123456789ABCDEFGHJKMNPQRSTVWXYZ";

pub fn new_id() -> String {
    encode_ulid(now_millis(), random_tail())
}

fn now_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default()
}

fn random_tail() -> u128 {
    let counter = COUNTER.fetch_add(1, Ordering::Relaxed) as u128;
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();

    nanos ^ (counter << 32)
}

fn encode_ulid(timestamp_ms: u128, entropy: u128) -> String {
    let value = ((timestamp_ms & ((1u128 << 48) - 1)) << 80) | (entropy & ((1u128 << 80) - 1));
    let mut output = [b'0'; 26];

    for index in (0..26).rev() {
        output[index] = ENCODING[(value >> ((25 - index) * 5) & 31) as usize];
    }

    String::from_utf8_lossy(&output).into_owned()
}
