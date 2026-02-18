-- Add show_on_dashboard for users who want to appear on dashboard (for existing DBs)
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_dashboard BOOLEAN DEFAULT false;
