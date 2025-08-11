const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database configuration
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('📁 Connected to SQLite database');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          avatar TEXT,
          location TEXT,
          phone TEXT,
          preferences TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Activities table
      db.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          location TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          organizer_id INTEGER NOT NULL,
          max_participants INTEGER DEFAULT 50,
          current_participants INTEGER DEFAULT 0,
          category TEXT,
          requirements TEXT,
          image TEXT,
          status TEXT DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (organizer_id) REFERENCES users (id)
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          booking_type TEXT NOT NULL,
          destination_city TEXT NOT NULL,
          destination_state TEXT NOT NULL,
          booking_date DATE NOT NULL,
          check_in_date DATE,
          check_out_date DATE,
          booking_details TEXT,
          status TEXT DEFAULT 'confirmed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Activity participants table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (activity_id) REFERENCES activities (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(activity_id, user_id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized');
          resolve();
        }
      });
    });
  });
};

// Load sample data from SQL file
const loadSampleData = () => {
  try {
    const sqlFile = path.join(__dirname, 'seed.sql');
    if (!fs.existsSync(sqlFile)) {
      console.log('⚠️  Seed file not found, skipping sample data');
      return;
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL file by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`📝 Loading ${statements.length} SQL statements...`);
    
    statements.forEach((statement, index) => {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        db.run(trimmedStatement, function(err) {
          if (err) {
            console.error(`❌ Error executing SQL statement ${index + 1}:`, err.message);
          }
        });
      }
    });
    
    console.log('✅ Sample data loaded from seed.sql');
  } catch (error) {
    console.error('❌ Error loading seed data:', error.message);
  }
};

// Database operations
const dbOperations = {
  // Get all activities
  getAllActivities: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar
        FROM activities a
        LEFT JOIN users u ON a.organizer_id = u.id
        WHERE a.status = 'active'
      `;
      
      const params = [];
      
      if (filters.city) {
        query += ' AND a.city = ?';
        params.push(filters.city);
      }
      
      if (filters.category) {
        query += ' AND a.category = ?';
        params.push(filters.category);
      }
      
      if (filters.date) {
        query += ' AND a.date >= ?';
        params.push(filters.date);
      }
      
      query += ' ORDER BY a.date ASC, a.time ASC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get activity by ID
  getActivityById: (id) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar, u.email as organizer_email
        FROM activities a
        LEFT JOIN users u ON a.organizer_id = u.id
        WHERE a.id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Create new activity
  createActivity: (activityData) => {
    return new Promise((resolve, reject) => {
      const {
        title, description, location, city, state, date, time,
        organizer_id, max_participants, category, requirements, image
      } = activityData;

      db.run(`
        INSERT INTO activities (title, description, location, city, state, date, time, organizer_id, max_participants, category, requirements, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, description, location, city, state, date, time, organizer_id, max_participants, category, requirements, image], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...activityData });
        }
      });
    });
  },

  // Get user by ID
  getUserById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get user by email
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Create new user
  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { name, email, password, points = 0, level = 1, avatar, location = '', phone = '', preferences = '{}' } = userData;
      
      db.run(`
        INSERT INTO users (name, email, password, points, level, avatar, location, phone, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, email, password, points, level, avatar, location, phone, preferences], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            name,
            email,
            points,
            level,
            avatar,
            location,
            phone,
            preferences
          });
        }
      });
    });
  },

  // Get user bookings
  getUserBookings: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM bookings 
        WHERE user_id = ? 
        ORDER BY booking_date DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Create booking
  createBooking: (bookingData) => {
    return new Promise((resolve, reject) => {
      const {
        user_id, booking_type, destination_city, destination_state,
        booking_date, check_in_date, check_out_date, booking_details, status = 'confirmed'
      } = bookingData;

      db.run(`
        INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...bookingData });
        }
      });
    });
  },

  // Update user profile
  updateUserProfile: (userId, updateData) => {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      values.push(userId);

      db.run(`
        UPDATE users 
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  },

  // Get user statistics
  getUserStats: (userId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          u.points as totalPoints,
          u.level,
          (SELECT COUNT(*) FROM bookings WHERE user_id = ? AND booking_type != 'activity') as totalTrips,
          (SELECT COUNT(*) FROM activity_participants WHERE user_id = ?) as totalActivities,
          (SELECT COUNT(DISTINCT activity_id) FROM activity_participants WHERE user_id = ?) as causesSupported
        FROM users u WHERE u.id = ?
      `, [userId, userId, userId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalTrips: row?.totalTrips || 0,
            totalActivities: row?.totalActivities || 0,
            pointsEarned: row?.totalPoints || 0,
            causesSupported: row?.causesSupported || 0,
            level: row?.level || 1
          });
        }
      });
    });
  }
};

module.exports = {
  initializeDatabase,
  loadSampleData,
  dbOperations,
  db
};
