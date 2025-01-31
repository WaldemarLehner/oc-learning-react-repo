-- Drop the Project table if it exists
DROP TABLE IF EXISTS time_entry;

-- Drop the Entry table if it exists
DROP TABLE IF EXISTS project;

DROP VIEW IF EXISTS time_entry_project_view;

-- Create Project Table
CREATE TABLE project (
  id TEXT PRIMARY KEY,          -- UUID for project, using TEXT as SQLite doesn't have a UUID type
  customer_name TEXT NOT NULL,  -- Customer's name
  project_name TEXT NOT NULL    -- Project's name
);

-- Create Entry Table
CREATE TABLE time_entry (
  id TEXT PRIMARY KEY,                -- UUID for entry, using TEXT as SQLite doesn't have a UUID type
  time_from DATETIME NOT NULL,        -- Entry start time (ISO 8601 string format for datetime)
  time_to DATETIME NOT NULL,          -- Entry end time (ISO 8601 string format for datetime)
  project_id TEXT NOT NULL,           -- Foreign key to the Project table
  break_duration_minutes INTEGER,     -- Optional break duration in minutes (could be NULL)
  description TEXT NOT NULL,          -- Description of the entry
  FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE  -- Foreign key constraint
);

CREATE VIEW time_entry_project_view AS
SELECT 
    te.id AS entry_id, 
    te.time_from, 
    te.time_to, 
    te.project_id, 
    te.break_duration_minutes, 
    te.description, 
    p.customer_name, 
    p.project_name 
FROM 
    time_entry te 
LEFT JOIN 
    project p ON p.id = te.project_id;



-- Initial Values for Testing

INSERT INTO project (id, customer_name, project_name) VALUES 
('9e79987a-e1ce-4a0f-98a8-f8cc8c6d2cf2', 'Example Ltd.', 'Example Project'),
('1c689d20-5607-4f25-82aa-128554b729a0', 'Testing Ltd.', 'Test Project'),
('115d9f42-83a8-4178-91b1-c537435d08ff', 'Testing Ltd.', 'Another Project');

INSERT INTO time_entry(id, time_from, time_to, project_id, break_duration_minutes, description) VALUES
('36143b2f-0865-412f-b079-506a04772072', '2024-12-13T11:00:00Z', '2024-12-13T15:00:00Z', '9e79987a-e1ce-4a0f-98a8-f8cc8c6d2cf2', 30, 'Begin Setting up example project'),
('d684ec8b-c6cb-4051-8459-46f63e21423b', '2024-12-15T11:00:00Z', '2024-12-13T16:00:00Z', '9e79987a-e1ce-4a0f-98a8-f8cc8c6d2cf2', 0, 'Begin some more stuff'),
('e17fbbf4-c9fd-4b11-90cf-a2263139f37c', '2024-11-13T11:00:00Z', '2024-11-13T15:00:00Z', '115d9f42-83a8-4178-91b1-c537435d08ff', 30, 'Do something');