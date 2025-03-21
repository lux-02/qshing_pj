CREATE TABLE qr_codes (
    id VARCHAR2(36) PRIMARY KEY,
    original_url VARCHAR2(4000) NOT NULL,
    description VARCHAR2(4000),
    address VARCHAR2(4000),
    last_scanned_at TIMESTAMP,
    last_scanned_url VARCHAR2(4000),
    is_compromised NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    normalized_original_url VARCHAR2(4000),
    normalized_scanned_url VARCHAR2(4000)
); 