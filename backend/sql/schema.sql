-- AI Expense Tracker - PostgreSQL Schema

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (user_id, name, type)
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,

    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),

    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),

    description VARCHAR(255),
    notes TEXT,

    transaction_date DATE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_txn_user_date
ON transactions(user_id, transaction_date DESC);

CREATE INDEX idx_txn_category
ON transactions(category_id);

CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),

    period VARCHAR(10)
    NOT NULL
    DEFAULT 'monthly'
    CHECK (period IN ('monthly', 'weekly')),

    start_date DATE NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (user_id, category_id, period)
);

CREATE TABLE ai_insights (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    insight_type VARCHAR(50) NOT NULL,

    period_start DATE,
    period_end DATE,

    content_json JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_insights_user_created
ON ai_insights(user_id, created_at DESC);

CREATE TABLE recurring_transactions (
    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    category_id INT REFERENCES categories(id) ON DELETE SET NULL,

    type VARCHAR(10) NOT NULL
    CHECK (type IN ('income', 'expense')),

    amount NUMERIC(12,2) NOT NULL,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    frequency VARCHAR(20) NOT NULL
    CHECK (
        frequency IN (
            'daily',
            'weekly',
            'monthly',
            'quarterly',
            'semi_annually',
            'yearly'
        )
    ),

    start_date DATE NOT NULL,

    next_run_date DATE NOT NULL,

    last_run_date DATE,

    auto_create BOOLEAN DEFAULT TRUE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),

    message TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);