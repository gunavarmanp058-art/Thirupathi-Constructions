const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log("Updating existing project typo...");
  await connection.execute(
    "UPDATE projects SET name = 'Major Water Pipeline Project' WHERE name = 'water piplie'"
  );

  console.log("Adding more projects...");
  const projects = [
    ['Urban Water Supply Network', 'WATER', 'ONGOING', 'Coimbatore', '2024-01-10', '2024-12-31', '2025-01-15'],
    ['Rural Irrigation Pipeline-II', 'WATER', 'PLANNED', 'Madurai', '2024-06-01', '2025-05-30', '2025-06-15'],
    ['Salem Highway Development', 'ROAD', 'COMPLETED', 'Salem', '2023-01-15', '2023-11-20', '2023-11-25'],
    ['Trichy Bridge Reconstruction', 'ROAD', 'ONGOING', 'Trichy', '2024-02-15', '2024-10-10', '2024-11-01']
  ];

  for (const p of projects) {
    await connection.execute(
      "INSERT INTO projects (name, type, status, location, planned_start, planned_end, expected_end) VALUES (?, ?, ?, ?, ?, ?, ?)",
      p
    );
  }

  // Also add some progress for the ongoing projects
  const [rows] = await connection.execute("SELECT id FROM projects WHERE status = 'ONGOING'");
  for (const row of rows) {
    await connection.execute(
      "INSERT INTO project_progress (project_id, week_date, planned_percent, actual_percent, notes) VALUES (?, CURDATE(), 40, 35, 'Project moving as per schedule.')",
      [row.id]
    );
  }

  console.log("Seeding complete.");
  await connection.end();
}

seed().catch(console.error);
