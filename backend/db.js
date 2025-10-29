// Conditional DB adapter: use MongoDB when MONGO_URI is provided, otherwise fall back to file-backed JSON.
const fs = require('fs');
const path = require('path');
let MongoClient, ObjectId;
try {
  // require lazily so local file-mode works even if mongodb isn't installed
  ({ MongoClient, ObjectId } = require('mongodb'));
} catch (e) {
  MongoClient = null;
  ObjectId = null;
}

const DATA_FILE = path.join(__dirname, 'data', 'data.json');
let fileData = {
  users: [], bookings: [], rides: [], vehicles: [], payments: [], reviews: [], alerts: [], otps: [], children: [], contacts: [], addresses: [], pins: [], presets: []
};

let client = null;
let db = null;
let mode = 'file'; // 'file' or 'mongo'

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadFile() {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      fileData = JSON.parse(raw);
    } else {
      saveFile();
    }
  } catch (err) {
    console.error('Failed to load data file, reinitializing:', err.message);
    saveFile();
  }
}

function saveFile() {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2), 'utf8');
}

function genId() { return (Date.now() + Math.floor(Math.random() * 1000)).toString(); }

async function connect(mongoUri) {
  if (mongoUri && MongoClient) {
    try {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db();
      mode = 'mongo';
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error('MongoDB connect failed, falling back to file store:', err.message);
      mode = 'file';
    }
  }
  // fallback to file
  loadFile();
  mode = 'file';
}

function ensureCollection(name) { fileData[name] = fileData[name] || []; }

async function get(collection) {
  if (mode === 'mongo') {
    const docs = await db.collection(collection).find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(d => { const out = Object.assign({}, d); out.id = out._id.toString(); delete out._id; return out; });
  }
  ensureCollection(collection);
  return Promise.resolve(fileData[collection]);
}

async function add(collection, item) {
  if (mode === 'mongo') {
    const toInsert = Object.assign({}, item);
    toInsert.createdAt = Date.now();
    const r = await db.collection(collection).insertOne(toInsert);
    toInsert.id = r.insertedId.toString();
    return toInsert;
  }
  ensureCollection(collection);
  const record = Object.assign({}, item);
  if (!record.id) record.id = genId();
  record.createdAt = Date.now();
  fileData[collection].push(record);
  saveFile();
  return Promise.resolve(record);
}

async function find(collection, predicateFn) {
  if (mode === 'mongo') {
    const all = await get(collection);
    return all.find(predicateFn);
  }
  ensureCollection(collection);
  return Promise.resolve((fileData[collection] || []).find(predicateFn));
}

async function update(collection, id, patch) {
  if (mode === 'mongo') {
    const _id = ObjectId && ObjectId.isValid(id) ? new ObjectId(id) : id;
    await db.collection(collection).updateOne({ _id }, { $set: patch });
    const updated = await db.collection(collection).findOne({ _id });
    if (!updated) return null;
    const out = Object.assign({}, updated);
    out.id = out._id.toString(); delete out._id;
    return out;
  }
  ensureCollection(collection);
  const idx = (fileData[collection] || []).findIndex(x => x.id === id);
  if (idx === -1) return null;
  fileData[collection][idx] = Object.assign({}, fileData[collection][idx], patch);
  saveFile();
  return Promise.resolve(fileData[collection][idx]);
}

async function remove(collection, id) {
  if (mode === 'mongo') {
    const _id = ObjectId && ObjectId.isValid(id) ? new ObjectId(id) : id;
    await db.collection(collection).deleteOne({ _id });
    return;
  }
  ensureCollection(collection);
  fileData[collection] = (fileData[collection] || []).filter(x => x.id !== id);
  saveFile();
  return;
}

module.exports = { connect, get, add, find, update, remove, __internal: { mode: () => mode } };
