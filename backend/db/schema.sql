-- VERA PRIVACY-FIRST SCHEMA (PostgreSQL)
-- We intentionally do not store Name, DOB, or ID images.

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    -- The only verification data we keep:
    is_adult_verified BOOLEAN DEFAULT FALSE,
    verification_token_id VARCHAR(255), -- Non-PII reference token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_status VARCHAR(20) DEFAULT 'inactive'
);
