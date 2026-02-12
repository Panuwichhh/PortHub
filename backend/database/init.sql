-- USERS
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    university VARCHAR(255),
    faculty VARCHAR(255),
    major VARCHAR(255),
    gpa DECIMAL(3,2),
    job_interest TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VERIFICATION CODES
CREATE TABLE verification_codes (
    code_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    type VARCHAR(50),
    is_used BOOLEAN DEFAULT FALSE,
    expired_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    project_name VARCHAR(255),
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SKILLS
CREATE TABLE skills (
    skill_id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE
);

-- USER_SKILLS (Many-to-Many)
CREATE TABLE user_skills (
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, skill_id)
);
