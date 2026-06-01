import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDatabase() {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('barber_app.db');
  await initDatabase(db);
  return db;
}

async function initDatabase(database) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      telegram TEXT,
      haircut_description TEXT,
      preferences TEXT,
      notes TEXT,
      avatar_color TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      date TEXT NOT NULL,
      time_start TEXT NOT NULL,
      time_end TEXT,
      service TEXT,
      notes TEXT,
      status TEXT DEFAULT 'scheduled',
      is_walkin INTEGER DEFAULT 0,
      walkin_name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      date TEXT DEFAULT (date('now')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
    CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
    CREATE INDEX IF NOT EXISTS idx_memories_client ON memories(client_id);
  `);

  // --- Migrations: add notification columns if missing ---
  const cols = await database.getAllAsync(`PRAGMA table_info(appointments)`);
  const colNames = cols.map((c) => c.name);
  if (!colNames.includes('notification_id')) {
    await database.execAsync(`ALTER TABLE appointments ADD COLUMN notification_id TEXT`);
  }
  if (!colNames.includes('reminder_minutes')) {
    await database.execAsync(`ALTER TABLE appointments ADD COLUMN reminder_minutes INTEGER DEFAULT 60`);
  }

  // Seed defaults
  await database.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('reminders_enabled', '1')`
  );
  await database.runAsync(
    `INSERT OR IGNORE INTO settings (key, value) VALUES ('reminder_minutes', '60')`
  );
}

// === SETTINGS ===

export async function getSetting(key, fallback = null) {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, String(value)]
  );
}

// === CLIENTS ===

export async function getAllClients() {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM clients ORDER BY name ASC'
  );
}

export async function searchClients(query) {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM clients WHERE name LIKE ? OR phone LIKE ? ORDER BY name ASC',
    [`%${query}%`, `%${query}%`]
  );
}

export async function getClient(id) {
  const database = await getDatabase();
  return await database.getFirstAsync(
    'SELECT * FROM clients WHERE id = ?',
    [id]
  );
}

export async function createClient(client) {
  const database = await getDatabase();
  const colors = ['#D4AF37', '#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899', '#6366F1'];
  const avatar_color = colors[Math.floor(Math.random() * colors.length)];
  
  const result = await database.runAsync(
    `INSERT INTO clients (name, phone, whatsapp, telegram, haircut_description, preferences, notes, avatar_color)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [client.name, client.phone || null, client.whatsapp || null, client.telegram || null,
     client.haircut_description || null, client.preferences || null, client.notes || null, avatar_color]
  );
  return result.lastInsertRowId;
}

export async function updateClient(id, client) {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE clients SET name = ?, phone = ?, whatsapp = ?, telegram = ?,
     haircut_description = ?, preferences = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [client.name, client.phone || null, client.whatsapp || null, client.telegram || null,
     client.haircut_description || null, client.preferences || null, client.notes || null, id]
  );
}

export async function deleteClient(id) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM clients WHERE id = ?', [id]);
}

// === APPOINTMENTS ===

export async function getAppointmentsByDate(date) {
  const database = await getDatabase();
  return await database.getAllAsync(
    `SELECT a.*, c.name as client_name, c.avatar_color, c.phone as client_phone
     FROM appointments a
     LEFT JOIN clients c ON a.client_id = c.id
     WHERE a.date = ?
     ORDER BY a.time_start ASC`,
    [date]
  );
}

export async function getAppointmentsByClient(clientId) {
  const database = await getDatabase();
  return await database.getAllAsync(
    `SELECT * FROM appointments WHERE client_id = ? ORDER BY date DESC, time_start DESC`,
    [clientId]
  );
}

export async function getAppointmentDates(month, year) {
  const database = await getDatabase();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  return await database.getAllAsync(
    `SELECT date, COUNT(*) as count FROM appointments 
     WHERE date >= ? AND date <= ? 
     GROUP BY date`,
    [startDate, endDate]
  );
}

export async function createAppointment(appointment) {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO appointments (client_id, date, time_start, time_end, service, notes, status, is_walkin, walkin_name, notification_id, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [appointment.client_id || null, appointment.date, appointment.time_start,
     appointment.time_end || null, appointment.service || null, appointment.notes || null,
     appointment.status || 'scheduled', appointment.is_walkin ? 1 : 0, appointment.walkin_name || null,
     appointment.notification_id || null, appointment.reminder_minutes ?? 60]
  );
  return result.lastInsertRowId;
}

export async function updateAppointment(id, appointment) {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE appointments SET client_id = ?, date = ?, time_start = ?, time_end = ?,
     service = ?, notes = ?, status = ?, is_walkin = ?, walkin_name = ?, notification_id = ?, reminder_minutes = ?
     WHERE id = ?`,
    [appointment.client_id || null, appointment.date, appointment.time_start,
     appointment.time_end || null, appointment.service || null, appointment.notes || null,
     appointment.status || 'scheduled', appointment.is_walkin ? 1 : 0, appointment.walkin_name || null,
     appointment.notification_id || null, appointment.reminder_minutes ?? 60, id]
  );
}

export async function getAppointment(id) {
  const database = await getDatabase();
  return await database.getFirstAsync('SELECT * FROM appointments WHERE id = ?', [id]);
}

export async function deleteAppointment(id) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
}

// === MEMORIES ===

export async function getMemories(clientId) {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM memories WHERE client_id = ? ORDER BY created_at DESC',
    [clientId]
  );
}

export async function addMemory(clientId, content) {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO memories (client_id, content) VALUES (?, ?)',
    [clientId, content]
  );
  return result.lastInsertRowId;
}

export async function deleteMemory(id) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM memories WHERE id = ?', [id]);
}

// === STATS ===

export async function getTodayAppointmentsCount() {
  const database = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const result = await database.getFirstAsync(
    'SELECT COUNT(*) as count FROM appointments WHERE date = ?',
    [today]
  );
  return result.count;
}

export async function getTotalClients() {
  const database = await getDatabase();
  const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM clients');
  return result.count;
}
