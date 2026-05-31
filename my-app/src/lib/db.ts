import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
const schemaPath = path.join(process.cwd(), 'src', 'lib', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Seed palette data if empty
const count = db.prepare('SELECT COUNT(*) as count FROM palettes').get() as { count: number };
if (count.count === 0) {
  const paletteData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'mard-palette.json'), 'utf-8'));
  const insert = db.prepare(
    'INSERT INTO palettes (brand, color_no, name, hex, rgb) VALUES (?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((colors: Array<{brand: string, color_no: string, name: string, hex: string, rgb: string}>) => {
    for (const color of colors) {
      insert.run(color.brand, color.color_no, color.name, color.hex, color.rgb);
    }
  });
  insertMany(paletteData);
}

export default db;
