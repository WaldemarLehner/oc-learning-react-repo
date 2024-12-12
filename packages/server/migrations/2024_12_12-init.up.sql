-- Drop the Project table if it exists
DROP TABLE IF EXISTS time_entry;

-- Drop the Entry table if it exists
DROP TABLE IF EXISTS project;

-- Create Project Table
CREATE TABLE project (
  id TEXT PRIMARY KEY DEFAULT (uuid()),          -- UUID for project, using TEXT as SQLite doesn't have a UUID type
  customer_name TEXT NOT NULL,  -- Customer's name
  project_name TEXT NOT NULL    -- Project's name
);

-- Create Entry Table
CREATE TABLE time_entry (
  id TEXT PRIMARY KEY DEFAULT (uuid()),                -- UUID for entry, using TEXT as SQLite doesn't have a UUID type
  time_from DATETIME NOT NULL,        -- Entry start time (ISO 8601 string format for datetime)
  time_to DATETIME NOT NULL,          -- Entry end time (ISO 8601 string format for datetime)
  project_id TEXT NOT NULL,           -- Foreign key to the Project table
  break_duration_minutes INTEGER,     -- Optional break duration in minutes (could be NULL)
  description TEXT NOT NULL,          -- Description of the entry
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE  -- Foreign key constraint
);