const express = require('express');
const { Pool } = require('pg');

const app = express();

// DB connection details come from environment variables
// new commen
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// Create the table, retrying until the DB is ready
async function initDb() {
  for (let i = 0; i < 30; i++) {
    try {
      await pool.query(
        'CREATE TABLE IF NOT EXISTS visits (id SERIAL PRIMARY KEY, ts TIMESTAMP DEFAULT now())'
      );
      console.log('Database ready');
      return;
    } catch (err) {
      console.log('Waiting for database...', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/visit', async (req, res) => {
  try {
    await pool.query('INSERT INTO visits DEFAULT VALUES');
    const result = await pool.query('SELECT count(*) FROM visits');
    res.json({ visits: Number(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(3000, () => console.log('Backend listening on port 3000'));
  initDb();
}

module.exports = app;
