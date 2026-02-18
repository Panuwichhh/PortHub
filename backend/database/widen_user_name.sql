-- Widen user_name to allow longer names (was VARCHAR(100))
ALTER TABLE users ALTER COLUMN user_name TYPE VARCHAR(255);
