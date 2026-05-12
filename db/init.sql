-- CREATE DATABASE IF NOT EXISTS siadi_db
SELECT 'CREATE DATABASE siadi_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'siadi_db')\gexec