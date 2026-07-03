const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.join(__dirname, 'homeview.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the HomeView SQLite database.');
        // Ensure tables exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS houses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                location TEXT,
                price REAL,
                description TEXT,
                owner_name TEXT,
                owner_email TEXT,
                status TEXT DEFAULT 'pending',
                submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                views INTEGER DEFAULT 0,
                photo_urls TEXT
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT,
                bio TEXT,
                phone TEXT,
                profile_pic TEXT,
                joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS unlocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                house_id INTEGER,
                unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Add profile_pic column if it doesn't exist (for existing databases)
            db.run(`ALTER TABLE users ADD COLUMN profile_pic TEXT`, (err) => {
                // Ignore error if column already exists
            });
            
            // Seed default admin
            db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role, bio, phone) 
                    VALUES ('admin_root', 'Admin', 'admin@homeview.com', 'admin123', 'admin', 'Global Platform Governance', '+254 700 000 000')`);

            // Seed sample approved houses if none exist
            db.get('SELECT COUNT(*) as count FROM houses WHERE status = "approved"', [], (err, row) => {
                if (!err && row && row.count === 0) {
                    const sampleHouses = [
                        { title: 'Emerald Luxury 2-Bedroom', location: 'Westlands, Nairobi', price: 45000, description: 'Experience luxury living in the heart of Westlands. This stunning 2-bedroom apartment features modern amenities, an open-concept living space, and breathtaking city views. Enjoy high-speed WiFi, a fully equipped kitchen, and 24/7 security in a premium building.', owner_name: 'Nelson Omwenga', owner_email: 'nelson@caretaker.com', status: 'approved' },
                        { title: 'Modern Studio Apartment', location: 'Kilimani, Nairobi', price: 25000, description: 'A sleek, fully furnished studio in the heart of Kilimani. Perfect for young professionals looking for affordable luxury with great city connectivity.', owner_name: 'Peris Wanjiku', owner_email: 'peris@caretaker.com', status: 'approved' },
                        { title: 'Sapphire Penthouse Suite', location: 'Kileleshwa, Nairobi', price: 85000, description: 'Live above it all in this spectacular penthouse with panoramic city views. Premium finishes, private terrace, and full concierge services included.', owner_name: 'Nelson Omwenga', owner_email: 'nelson@caretaker.com', status: 'approved' },
                        { title: 'Garden View 1-Bedroom', location: 'Lavington, Nairobi', price: 35000, description: 'A warm and cozy 1-bedroom flat in the serene Lavington area. Features a private garden, modern kitchen, and secure underground parking.', owner_name: 'Jane Doe', owner_email: 'jane@caretaker.com', status: 'approved' },
                        { title: 'Executive 3-Bedroom Townhouse', location: 'Karen, Nairobi', price: 120000, description: 'Expansive executive townhouse in the prestigious Karen suburb. Features 3 bedrooms, a private swimming pool, home office, and lush garden.', owner_name: 'John Kamau', owner_email: 'john@caretaker.com', status: 'approved' },
                        { title: 'Bedsitter with Balcony', location: 'Ruaka, Nairobi', price: 12000, description: 'Affordable and comfortable bedsitter with a beautiful balcony overlooking the lush Ruaka hills. Perfect for students and young professionals.', owner_name: 'Jane Doe', owner_email: 'jane@caretaker.com', status: 'approved' }
                    ];
                    sampleHouses.forEach(h => {
                        db.run(
                            `INSERT INTO houses (title, location, price, description, owner_name, owner_email, status, photo_urls) VALUES (?, ?, ?, ?, ?, ?, ?, '[]')`,
                            [h.title, h.location, h.price, h.description, h.owner_name, h.owner_email, h.status]
                        );
                    });
                    console.log('Seeded 6 sample approved houses.');
                }
            });
        });
    }
});

// Auth Routes

// Signup
app.post('/auth/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    const id = Date.now().toString();
    const query = `INSERT INTO users (id, name, email, password, role, bio, phone, profile_pic) VALUES (?, ?, ?, ?, ?, '', '', '')`;
    
    db.run(query, [id, name, email, password, role || 'tenant'], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, user: { id, name, email, role: role || 'tenant' } });
    });
});

// Login
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    
    db.get(query, [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        res.json({ success: true, user });
    });
});

// Get Profile
app.get('/auth/profile/:id', (req, res) => {
    const query = 'SELECT * FROM users WHERE id = ?';

    db.get(query, [req.params.id], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, user });
    });
});

// Update Profile
app.put('/auth/profile/:id', (req, res) => {
    const { name, bio, phone, profile_pic } = req.body;
    const query = 'UPDATE users SET name = ?, bio = ?, phone = ?, profile_pic = ? WHERE id = ?';
    
    db.run(query, [name, bio, phone, profile_pic, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        
        db.get('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
            res.json({ success: true, user });
        });
    });
});

// Profile Pic Upload (Direct)
app.post('/auth/profile-pic/:id', (req, res) => {
    const { profile_pic } = req.body;
    const query = 'UPDATE users SET profile_pic = ? WHERE id = ?';
    
    db.run(query, [profile_pic, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Users Route
app.get('/users', (req, res) => {
    const query = 'SELECT id, name, email, role, bio, phone, joinedAt FROM users ORDER BY joinedAt DESC';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/users/', (req, res) => {
    const query = 'SELECT id, name, email, role, bio, phone, joinedAt FROM users ORDER BY joinedAt DESC';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Unlocks Route
app.get('/unlocks', (req, res) => {
    const query = 'SELECT * FROM unlocks ORDER BY unlocked_at DESC';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/unlocks/', (req, res) => {
    const query = 'SELECT * FROM unlocks ORDER BY unlocked_at DESC';
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// House Routes

// Get all houses
app.get('/houses', (req, res) => {
    const query = 'SELECT * FROM houses ORDER BY submission_date DESC';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single house
app.get('/houses/:id', (req, res) => {
    const query = 'SELECT * FROM houses WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'House not found' });
            return;
        }
        res.json(row);
    });
});

// Create house
app.post('/houses', (req, res) => {
    const { title, location, price, description, owner_name, owner_email, photo_urls } = req.body;
    const query = `INSERT INTO houses (title, location, price, description, owner_name, owner_email, photo_urls) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [title, location, price, description, owner_name, owner_email, photo_urls];
    
    db.run(query, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body, status: 'pending' });
    });
});

// Update house (any fields)
app.put('/houses/:id', (req, res) => {
    const updates = req.body;
    const allowedFields = ['title', 'location', 'price', 'description', 'owner_name', 'owner_email', 'status', 'photo_urls', 'views'];
    const fields = [];
    const values = [];

    allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
            fields.push(`${field} = ?`);
            values.push(updates[field]);
        }
    });

    if (!fields.length) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.params.id);
    const query = `UPDATE houses SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, values, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'House not found' });
            return;
        }
        db.get('SELECT * FROM houses WHERE id = ?', [req.params.id], (err2, row) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json(row);
        });
    });
});

// Delete house
app.delete('/houses/:id', (req, res) => {
    const query = 'DELETE FROM houses WHERE id = ?';
    db.run(query, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'House not found' });
            return;
        }
        res.json({ message: 'House deleted successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`HomeView Node Backend running at http://localhost:${PORT}`);
});
