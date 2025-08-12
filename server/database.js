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
          short_description TEXT,
          description TEXT,
          location TEXT NOT NULL,
          city TEXT NOT NULL,
          state TEXT NOT NULL,
          country TEXT DEFAULT 'India',
          date DATE NOT NULL,
          time TIME NOT NULL,
          end_date DATE,
          end_time TIME,
          duration INTEGER, -- in minutes
          organizer_id INTEGER NOT NULL,
          min_participants INTEGER DEFAULT 1,
          max_participants INTEGER DEFAULT 50,
          current_participants INTEGER DEFAULT 0,
          category TEXT,
          tags TEXT, -- JSON array of tags
          requirements TEXT, -- guidelines as text
          requirements_age_min INTEGER,
          requirements_age_max INTEGER,
          requirements_skills TEXT, -- JSON array
          requirements_items TEXT, -- JSON array
          impact_goal TEXT,
          impact_metrics TEXT, -- JSON array
          points_participant INTEGER DEFAULT 50,
          points_organizer INTEGER DEFAULT 100,
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
          otp_code TEXT,
          otp_verified BOOLEAN DEFAULT FALSE,
          activity_started BOOLEAN DEFAULT FALSE,
          activity_completed BOOLEAN DEFAULT FALSE,
          points_awarded BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (activity_id) REFERENCES activities (id),
          FOREIGN KEY (user_id) REFERENCES users (id),
          UNIQUE(activity_id, user_id)
        )
      `);

      // Activity OTP table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_otps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER NOT NULL,
          otp_code TEXT NOT NULL,
          generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          FOREIGN KEY (activity_id) REFERENCES activities (id)
        )
      `);

      // Activity reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review TEXT,
          helpful_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
  // First check if database already has data
  db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
    if (err) {
      console.error('❌ Error checking database data:', err);
      return;
    }
    
    if (result.count > 0) {
      console.log('📊 Database already contains data, skipping sample data loading');
      return;
    }
    
    console.log('📝 Database is empty, loading sample data...');
    
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
        if (trimmedStatement.startsWith('INSERT INTO bookings')) {
          console.log(`🔄 Executing booking statement ${index + 1}`);
        }
        db.run(trimmedStatement, function(err) {
          if (err) {
            console.error(`❌ Error executing SQL statement ${index + 1}:`, err.message);
            if (trimmedStatement.startsWith('INSERT INTO bookings')) {
              console.log(`❌ Failed booking statement: ${trimmedStatement.substring(0, 100)}...`);
            }
          } else if (trimmedStatement.startsWith('INSERT INTO bookings')) {
            console.log(`✅ Successfully executed booking statement ${index + 1}`);
          }
        });
      }
    });
    
      console.log('✅ Sample data loaded from seed.sql');
    } catch (error) {
      console.error('❌ Error loading seed data:', error.message);
    }
  });
};

// Database operations
const dbOperations = {
  // Get all activities (excluding user's own organized and joined activities)
  getAllActivities: (filters = {}) => {
    return new Promise((resolve, reject) => {
      const { userId, ...otherFilters } = filters;
      
      let query = `
        SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
               COUNT(ap_count.user_id) as current_participants
        FROM activities a
        LEFT JOIN users u ON a.organizer_id = u.id
        LEFT JOIN activity_participants ap_count ON a.id = ap_count.activity_id
      `;
      
      let whereConditions = ['a.status = \'active\'', 'a.date >= DATE(\'now\')'];
      const params = [];
      
      // Exclude user's organized and joined activities if userId provided
      if (userId) {
        query += ` LEFT JOIN activity_participants ap ON a.id = ap.activity_id AND ap.user_id = ?`;
        params.push(userId);
        whereConditions.push('a.organizer_id != ?');
        whereConditions.push('ap.user_id IS NULL');
        params.push(userId);
      }
      
      query += ` WHERE ${whereConditions.join(' AND ')}`;
      
      if (otherFilters.city) {
        query += ' AND (a.city LIKE ? OR a.state LIKE ?)';
        params.push(`%${otherFilters.city}%`, `%${otherFilters.city}%`);
      }
      
      if (otherFilters.category) {
        query += ' AND a.category = ?';
        params.push(otherFilters.category);
      }
      
      if (otherFilters.organizer_id) {
        query += ' AND a.organizer_id = ?';
        params.push(otherFilters.organizer_id);
      }
      
      if (otherFilters.search) {
        query += ' AND (a.title LIKE ? OR a.description LIKE ?)';
        params.push(`%${otherFilters.search}%`, `%${otherFilters.search}%`);
      }
      
      query += ' GROUP BY a.id ORDER BY a.date ASC, a.time ASC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const activities = rows.map(row => dbOperations.transformActivityData(row));
          resolve(activities);
        }
      });
    });
  },

  // Get user's activities (organized + joined)
  getMyActivities: (userId, filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT DISTINCT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
               CASE WHEN a.organizer_id = ? THEN 'organized' ELSE 'joined' END as user_relation
        FROM activities a
        LEFT JOIN users u ON a.organizer_id = u.id
        LEFT JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE a.status = 'active' 
          AND (a.organizer_id = ? OR ap.user_id = ?)
      `;
      
      const params = [userId, userId, userId];
      
      if (filters.city) {
        query += ' AND (a.city LIKE ? OR a.state LIKE ?)';
        params.push(`%${filters.city}%`, `%${filters.city}%`);
      }
      
      if (filters.category) {
        query += ' AND a.category = ?';
        params.push(filters.category);
      }
      
      if (filters.search) {
        query += ' AND (a.title LIKE ? OR a.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      query += ' ORDER BY a.date ASC, a.time ASC';
      
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const activities = rows.map(row => dbOperations.transformActivityData(row));
          resolve(activities);
        }
      });
    });
  },

  // Get recommended activities (same as suggestions but with more results)
  getRecommendedActivities: (userId, filters = {}) => {
    return new Promise((resolve, reject) => {
      // Use the existing suggestions logic but return more results
      dbOperations.getActivitySuggestions(userId)
        .then(activities => {
          let filtered = activities;
          
          if (filters.city) {
            filtered = filtered.filter(activity => 
              activity.city?.toLowerCase().includes(filters.city.toLowerCase()) ||
              activity.state?.toLowerCase().includes(filters.city.toLowerCase())
            );
          }
          
          if (filters.category) {
            filtered = filtered.filter(activity => activity.category === filters.category);
          }
          
          if (filters.search) {
            filtered = filtered.filter(activity =>
              activity.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
              activity.description?.toLowerCase().includes(filters.search.toLowerCase())
            );
          }
          
          resolve(filtered);
        })
        .catch(reject);
    });
  },

  // Get nearby activities (same as all activities for now)
  getNearbyActivities: (userId, filters = {}) => {
    // For now, return same as getAllActivities
    // In future, can implement geolocation-based filtering
    return dbOperations.getAllActivities({ ...filters, userId });
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
        } else if (!row) {
          resolve(null);
        } else {
          // Transform data to match frontend expectations
          const activity = {
            ...dbOperations.transformActivityData(row),
            organizer: {
              ...dbOperations.transformActivityData(row).organizer,
              email: row.organizer_email
            },
            registeredParticipants: []
          };
          resolve(activity);
        }
      });
    });
  },

  // Create new activity
  createActivity: (activityData) => {
    return new Promise((resolve, reject) => {
      const {
        title, short_description, description, location, city, state, country,
        date, time, end_date, end_time, duration, organizer_id,
        min_participants, max_participants, category, tags,
        requirements, requirements_age_min, requirements_age_max,
        requirements_skills, requirements_items, impact_goal, impact_metrics,
        points_participant, points_organizer, image
      } = activityData;

      db.run(`
        INSERT INTO activities (
          title, short_description, description, location, city, state, country,
          date, time, end_date, end_time, duration, organizer_id,
          min_participants, max_participants, category, tags,
          requirements, requirements_age_min, requirements_age_max,
          requirements_skills, requirements_items, impact_goal, impact_metrics,
          points_participant, points_organizer, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title, short_description, description, location, city, state, country,
        date, time, end_date, end_time, duration, organizer_id,
        min_participants, max_participants, category, tags,
        requirements, requirements_age_min, requirements_age_max,
        requirements_skills, requirements_items, impact_goal, impact_metrics,
        points_participant, points_organizer, image
      ], function(err) {
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
          (
            SELECT COUNT(DISTINCT a.id) 
            FROM activities a 
            LEFT JOIN activity_participants ap ON a.id = ap.activity_id 
            WHERE a.organizer_id = ? OR ap.user_id = ?
          ) as causesSupported
        FROM users u WHERE u.id = ?
      `, [userId, userId, userId, userId, userId], (err, row) => {
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
  },

  // Get activity suggestions based on user bookings
  getActivitySuggestions: (userId) => {
    return new Promise((resolve, reject) => {
      console.log(`🔍 Getting suggestions for userId: ${userId} (type: ${typeof userId})`);
      
      // Check total bookings in table first
      db.get(`SELECT COUNT(*) as total FROM bookings`, [], (err, count) => {
        if (err) {
          console.error('Error counting bookings:', err);
        } else {
          console.log(`📊 Total bookings in database: ${count.total}`);
        }
      });
      
      // First get user's booking destinations
      db.all(`
        SELECT DISTINCT destination_city, destination_state 
        FROM bookings 
        WHERE user_id = ?
      `, [userId], (err, destinations) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log(`🎯 Found ${destinations.length} destinations for user ${userId}:`, destinations);

        if (destinations.length === 0) {
          // No bookings, suggest popular activities (excluding self-organized and joined)
          db.all(`
            SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
                   COUNT(ap_count.user_id) as current_participants
            FROM activities a
            LEFT JOIN users u ON a.organizer_id = u.id
            LEFT JOIN activity_participants ap ON a.id = ap.activity_id AND ap.user_id = ?
            LEFT JOIN activity_participants ap_count ON a.id = ap_count.activity_id
            WHERE a.status = 'active' 
              AND a.organizer_id != ? 
              AND ap.user_id IS NULL
              AND a.date >= DATE('now')
            GROUP BY a.id
            ORDER BY current_participants DESC, a.date ASC
            LIMIT 10
          `, [userId, userId], (err, rows) => {
            if (err) {
              reject(err);
            } else {
              const activities = rows.map(row => dbOperations.transformActivityData(row));
              resolve(activities);
            }
          });
          return;
        }

        // Build query to find activities in booking destinations
        const placeholders = destinations.map(() => '(a.city = ? OR a.state = ?)').join(' OR ');
        const params = [];
        destinations.forEach(dest => {
          params.push(dest.destination_city, dest.destination_state);
        });
        
        console.log(`🔍 Query placeholders: ${placeholders}`);
        console.log(`🔍 Query params:`, params);

        // Add userId to params for excluding self-organized and joined activities
        params.push(userId, userId);
        
        db.all(`
          SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
                 COUNT(ap_count.user_id) as current_participants
          FROM activities a
          LEFT JOIN users u ON a.organizer_id = u.id
          LEFT JOIN activity_participants ap ON a.id = ap.activity_id AND ap.user_id = ?
          LEFT JOIN activity_participants ap_count ON a.id = ap_count.activity_id
          WHERE a.status = 'active' 
            AND (${placeholders}) 
            AND a.organizer_id != ? 
            AND ap.user_id IS NULL
            AND a.date >= DATE('now')
          GROUP BY a.id
          ORDER BY a.date ASC
          LIMIT 10
        `, params, (err, rows) => {
          if (err) {
            reject(err);
          } else if (rows.length === 0) {
            console.log(`❌ No activities found for user destinations, falling back to popular activities`);
            // No activities in booking destinations, suggest popular activities
            db.all(`
              SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
                     COUNT(ap_count.user_id) as current_participants
              FROM activities a
              LEFT JOIN users u ON a.organizer_id = u.id
              LEFT JOIN activity_participants ap ON a.id = ap.activity_id AND ap.user_id = ?
              LEFT JOIN activity_participants ap_count ON a.id = ap_count.activity_id
              WHERE a.status = 'active' 
                AND a.organizer_id != ? 
                AND ap.user_id IS NULL
                AND a.date >= DATE('now')
              GROUP BY a.id
              ORDER BY current_participants DESC, a.date ASC
              LIMIT 10
            `, [userId, userId], (err, fallbackRows) => {
              if (err) {
                reject(err);
              } else {
                const activities = fallbackRows.map(row => dbOperations.transformActivityData(row));
                resolve(activities);
              }
            });
          } else {
            console.log(`✅ Found ${rows.length} activities for user destinations`);
            const activities = rows.map(row => dbOperations.transformActivityData(row));
            resolve(activities);
          }
        });
      });
    });
  },

  // Helper function to transform activity data
  transformActivityData: (row) => {
    // Generate different images based on category
    const getImageByCategory = (category) => {
      const imageMap = {
        'Environment': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
        'Culture': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop',
        'Health': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
        'Education': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
        'Community': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop',
        'Wildlife': 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop'
      };
      return imageMap[category] || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop';
    };

    return {
      ...row,
      image: row.image || getImageByCategory(row.category),
      shortDescription: row.short_description,
      tags: row.tags ? JSON.parse(row.tags) : [],
      rating: {
        average: 4.2, // Default rating
        count: Math.floor(Math.random() * 20) + 1
      },
      reviews: [],
      pointsAwarded: {
        participant: row.points_participant || 50,
        organizer: row.points_organizer || 100
      },
      dateTime: {
        start: new Date(`${row.date}T${row.time || '00:00'}`).toISOString(),
        end: row.end_date && row.end_time ? new Date(`${row.end_date}T${row.end_time}`).toISOString() : new Date(`${row.date}T${row.time || '00:00'}`).toISOString()
      },
      duration: row.duration || 120,
      capacity: {
        min: row.min_participants || 1,
        max: row.max_participants || 10
      },
      // Frontend compatibility fields
      participants: row.current_participants || 0,
      maxParticipants: row.max_participants || 10,
      registeredParticipants: Array(row.current_participants || 0).fill({}), // Mock array for compatibility
      requirements: {
        guidelines: row.requirements || '',
        ageLimit: {
          min: row.requirements_age_min,
          max: row.requirements_age_max
        },
        skills: row.requirements_skills ? JSON.parse(row.requirements_skills) : [],
        items: row.requirements_items ? JSON.parse(row.requirements_items) : []
      },
      impact: {
        goal: row.impact_goal || '',
        metrics: row.impact_metrics ? JSON.parse(row.impact_metrics) : []
      },
      organizer: {
        id: row.organizer_id,
        name: row.organizer_name,
        avatar: row.organizer_avatar
      },
      verification: {
        status: 'approved', // Default verification status
        verifiedBy: 'MMT Cause Quest',
        verifiedAt: new Date().toISOString()
      }
    };
  },

  // Get activities that a user has joined
  getUserJoinedActivities: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar, 
               ap.joined_at, ap.otp_code, ap.otp_verified, ap.activity_started, 
               ap.activity_completed, ap.points_awarded,
               CASE WHEN ar.user_id IS NOT NULL THEN 1 ELSE 0 END as has_reviewed
        FROM activities a
        JOIN activity_participants ap ON a.id = ap.activity_id
        LEFT JOIN users u ON a.organizer_id = u.id
        LEFT JOIN activity_reviews ar ON a.id = ar.activity_id AND ap.user_id = ar.user_id
        WHERE ap.user_id = ? AND a.status = 'active'
        ORDER BY ap.joined_at DESC
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const activities = rows.map(row => {
            const transformedActivity = dbOperations.transformActivityData(row);
            return {
              ...transformedActivity,
              joinedAt: row.joined_at,
              type: 'joined',
              // Add participant-specific data
              otp_code: row.otp_code,
              otp_verified: Boolean(row.otp_verified),
              activity_started: Boolean(row.activity_started),
              activity_completed: Boolean(row.activity_completed),
              points_awarded: Boolean(row.points_awarded),
              has_reviewed: Boolean(row.has_reviewed)
            };
          });
          resolve(activities);
        }
      });
    });
  },

  // Join activity function
  joinActivity: (activityId, userId, userName) => {
    return new Promise((resolve, reject) => {
      // First check if user is already joined
      db.get(`
        SELECT * FROM activity_participants 
        WHERE activity_id = ? AND user_id = ?
      `, [activityId, userId], (err, existingParticipant) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (existingParticipant) {
          reject(new Error('User already joined this activity'));
          return;
        }
        
        // Add user to activity participants
        db.run(`
          INSERT INTO activity_participants (activity_id, user_id)
          VALUES (?, ?)
        `, [activityId, userId], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          // Update current participants count
          db.run(`
            UPDATE activities 
            SET current_participants = current_participants + 1 
            WHERE id = ?
          `, [activityId], (err) => {
            if (err) {
              reject(err);
            } else {
              console.log(`✅ User ${userId} joined activity ${activityId}`);
              resolve({ success: true });
            }
          });
        });
      });
    });
  },

  // Generate unique OTPs for each participant
  generateActivityOTP: (activityId) => {
    return new Promise((resolve, reject) => {
      // First, get all participants for this activity who don't have OTP yet
      db.all(`
        SELECT ap.id, ap.user_id, u.name, ap.otp_code
        FROM activity_participants ap
        JOIN users u ON ap.user_id = u.id
        WHERE ap.activity_id = ? AND ap.otp_verified = FALSE
      `, [activityId], (err, participants) => {
        if (err) {
          reject(err);
          return;
        }

        if (participants.length === 0) {
          reject(new Error('No participants found for this activity'));
          return;
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const otpPromises = [];
        const generatedOTPs = [];
        const existingOTPs = [];

        participants.forEach(participant => {
          if (participant.otp_code) {
            // Participant already has an OTP
            existingOTPs.push({
              userId: participant.user_id,
              userName: participant.name,
              otpCode: participant.otp_code
            });
          } else {
            // Generate unique 6-digit OTP for participants who don't have one
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            generatedOTPs.push({
              userId: participant.user_id,
              userName: participant.name,
              otpCode
            });

            // Update participant with their unique OTP
            const otpPromise = new Promise((resolveOTP, rejectOTP) => {
              db.run(`
                UPDATE activity_participants 
                SET otp_code = ? 
                WHERE id = ?
              `, [otpCode, participant.id], (err) => {
                if (err) {
                  rejectOTP(err);
                } else {
                  resolveOTP();
                }
              });
            });
            otpPromises.push(otpPromise);
          }
        });

        // Wait for all OTP updates to complete
        Promise.all(otpPromises)
          .then(() => {
            const totalParticipants = generatedOTPs.length + existingOTPs.length;
            
            if (generatedOTPs.length > 0) {
              console.log(`✅ Generated ${generatedOTPs.length} new OTPs for activity ${activityId}`);
              generatedOTPs.forEach(otp => {
                console.log(`   - ${otp.userName}: ${otp.otpCode}`);
              });
            }
            
            if (existingOTPs.length > 0) {
              console.log(`📋 ${existingOTPs.length} participants already have OTPs for activity ${activityId}`);
              existingOTPs.forEach(otp => {
                console.log(`   - ${otp.userName}: ${otp.otpCode} (existing)`);
              });
            }
            
            const message = generatedOTPs.length > 0 
              ? `Generated ${generatedOTPs.length} new OTPs. ${totalParticipants} participants total have OTPs.`
              : `All ${totalParticipants} participants already have OTPs.`;
            
            resolve({ 
              participantCount: totalParticipants,
              newOTPs: generatedOTPs.length,
              existingOTPs: existingOTPs.length,
              expiresAt,
              message: message + ' Participants can see their OTP in their profile.'
            });
          })
          .catch(reject);
      });
    });
  },

  // Validate OTP and start activity
  validateActivityOTP: (activityId, otpCode, userId) => {
    return new Promise((resolve, reject) => {
      // Check if user is organizer
      db.get(`
        SELECT organizer_id FROM activities WHERE id = ?
      `, [activityId], (err, activity) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (activity.organizer_id !== userId) {
          reject(new Error('Only the organizer can validate OTP'));
          return;
        }

        // Find the participant with this OTP
        db.get(`
          SELECT ap.*, u.name as participant_name
          FROM activity_participants ap
          JOIN users u ON ap.user_id = u.id
          WHERE ap.activity_id = ? AND ap.otp_code = ? AND ap.otp_verified = FALSE
        `, [activityId, otpCode], (err, participant) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (!participant) {
            reject(new Error('Invalid OTP or participant already verified'));
            return;
          }
          
          // Mark this specific participant as verified and activity as started
          db.run(`
            UPDATE activity_participants 
            SET otp_verified = TRUE, activity_started = TRUE 
            WHERE id = ?
          `, [participant.id], (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            console.log(`✅ Participant ${participant.participant_name} verified for activity ${activityId}`);
            resolve({ 
              success: true, 
              message: `${participant.participant_name} verified successfully! Activity started.`,
              participantName: participant.participant_name
            });
          });
        });
      });
    });
  },

  // Complete activity (for organizer)
  completeActivity: (activityId, userId) => {
    return new Promise((resolve, reject) => {
      // Check if user is organizer
      db.get(`
        SELECT organizer_id FROM activities WHERE id = ?
      `, [activityId], (err, activity) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (activity.organizer_id !== userId) {
          reject(new Error('Only the organizer can complete the activity'));
          return;
        }
        
        // Mark activity as completed and award organizer points
        db.run(`
          UPDATE activity_participants 
          SET activity_completed = TRUE 
          WHERE activity_id = ?
        `, [activityId], (err) => {
          if (err) {
            reject(err);
          } else {
            // Award organizer points
            db.run(`
              UPDATE users 
              SET points = points + (SELECT points_organizer FROM activities WHERE id = ?) 
              WHERE id = ?
            `, [activityId, userId], (err) => {
              if (err) {
                reject(err);
              } else {
                console.log(`✅ Activity ${activityId} completed and organizer points awarded`);
                resolve({ success: true, message: 'Activity completed successfully' });
              }
            });
          }
        });
      });
    });
  },

  // Submit activity review
  submitActivityReview: (activityId, userId, rating, review) => {
    return new Promise((resolve, reject) => {
      // Check if user participated in the activity and it's completed
      db.get(`
        SELECT * FROM activity_participants 
        WHERE activity_id = ? AND user_id = ? AND activity_completed = TRUE
      `, [activityId, userId], (err, participation) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!participation) {
          reject(new Error('You can only review activities you have completed'));
          return;
        }
        
        // Insert or update review
        db.run(`
          INSERT OR REPLACE INTO activity_reviews (activity_id, user_id, rating, review)
          VALUES (?, ?, ?, ?)
        `, [activityId, userId, rating, review], function(err) {
          if (err) {
            reject(err);
          } else {
            // Award participant points if not already awarded
            if (!participation.points_awarded) {
              // Get activity details for points
              db.get(`SELECT points_participant FROM activities WHERE id = ?`, [activityId], (err, activity) => {
                if (err) {
                  console.error('Error getting activity details:', err);
                  resolve({ success: true, message: 'Review submitted successfully' });
                  return;
                }

                // Update points awarded status
                db.run(`
                  UPDATE activity_participants 
                  SET points_awarded = TRUE 
                  WHERE activity_id = ? AND user_id = ?
                `, [activityId, userId], (err) => {
                  if (err) {
                    console.error('Error updating points awarded status:', err);
                  }
                });

                // Award points to user using the dedicated function
                dbOperations.awardPointsToUser(userId, activity.points_participant, 'Activity review submission')
                  .then(() => {
                    console.log(`✅ Review submitted and points awarded for activity ${activityId} by user ${userId}`);
                    resolve({ 
                      success: true, 
                      message: `Review submitted! You earned ${activity.points_participant} points!`,
                      pointsEarned: activity.points_participant
                    });
                  })
                  .catch((pointsErr) => {
                    console.error('Error awarding participant points:', pointsErr);
                    resolve({ success: true, message: 'Review submitted successfully' });
                  });
              });
            } else {
              console.log(`✅ Review submitted for activity ${activityId} by user ${userId}`);
              resolve({ success: true, message: 'Review updated successfully' });
            }
          }
        });
      });
    });
  },

  // Get activity reviews
  getActivityReviews: (activityId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ar.*, u.name as user_name, u.avatar as user_avatar 
        FROM activity_reviews ar
        JOIN users u ON ar.user_id = u.id
        WHERE ar.activity_id = ?
        ORDER BY ar.created_at DESC
      `, [activityId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Get activity average rating
  getActivityRating: (activityId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          AVG(rating) as average_rating,
          COUNT(*) as total_reviews
        FROM activity_reviews 
        WHERE activity_id = ?
      `, [activityId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            averageRating: row.average_rating || 0,
            totalReviews: row.total_reviews || 0
          });
        }
      });
    });
  },

  // Get user's activity status (for participants)
  getUserActivityStatus: (activityId, userId) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          ap.*,
          EXISTS(SELECT 1 FROM activity_reviews ar WHERE ar.activity_id = ? AND ar.user_id = ?) as has_reviewed
        FROM activity_participants ap
        WHERE ap.activity_id = ? AND ap.user_id = ?
      `, [activityId, userId, activityId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Get user's organized activities
  getUserOrganizedActivities: (userId) => {
    return new Promise((resolve, reject) => {
      console.log(`📝 Fetching organized activities for user ${userId}`);
      
      db.all(`
        SELECT a.*, u.name as organizer_name, u.avatar as organizer_avatar,
               COALESCE(MAX(ap.otp_verified), 0) as activity_started,
               COALESCE(MAX(ap.activity_completed), 0) as activity_completed,
               COUNT(ap.user_id) as current_participants,
               COUNT(CASE WHEN ap.otp_code IS NOT NULL THEN 1 END) as otps_generated,
               COUNT(CASE WHEN ap.otp_verified = 1 THEN 1 END) as otps_verified
        FROM activities a
        LEFT JOIN users u ON a.organizer_id = u.id
        LEFT JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE a.organizer_id = ? AND a.status = 'active'
        GROUP BY a.id
        ORDER BY a.date ASC, a.time ASC
      `, [userId], (err, rows) => {
        if (err) {
          console.error('Error fetching organized activities:', err);
          reject(err);
        } else {
          console.log(`✅ Found ${rows.length} organized activities for user ${userId}`);
          const activities = rows.map(row => {
            const activity = dbOperations.transformActivityData(row);
            return {
              ...activity,
              // Add organizer-specific state
              otps_generated: row.otps_generated,
              otps_verified: row.otps_verified,
              has_participants: row.current_participants > 0,
              otp_generation_available: row.current_participants > 0 && row.otps_generated === 0,
              otp_validation_available: row.otps_generated > 0 && row.otps_verified < row.otps_generated
            };
          });
          resolve(activities);
        }
      });
    });
  },

  // Get user points history
  getUserPointsHistory: (userId) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          'joined' as action_type,
          a.title as activity_title,
          a.points_participant as points_earned,
          a.date as earned_date,
          'participant' as role
        FROM activity_participants ap
        JOIN activities a ON ap.activity_id = a.id
        WHERE ap.user_id = ? AND ap.points_awarded = 1
        
        UNION ALL
        
        SELECT 
          'organized' as action_type,
          a.title as activity_title,
          a.points_organizer as points_earned,
          a.date as earned_date,
          'organizer' as role
        FROM activities a
        WHERE a.organizer_id = ? AND EXISTS (
          SELECT 1 FROM activity_participants ap2 
          WHERE ap2.activity_id = a.id AND ap2.otp_verified = 1
        )
        
        UNION ALL
        
        SELECT 
          'created' as action_type,
          a.title as activity_title,
          20 as points_earned,
          a.date as earned_date,
          'organizer' as role
        FROM activities a
        WHERE a.organizer_id = ?
        
        ORDER BY earned_date DESC
        LIMIT 50
      `, [userId, userId, userId], (err, rows) => {
        if (err) {
          console.error('Error in getUserPointsHistory:', err);
          reject(err);
        } else {
          const history = rows.map(row => ({
            action: row.action_type,
            activityTitle: row.activity_title,
            pointsEarned: row.points_earned,
            earnedDate: row.earned_date,
            role: row.role
          }));
          resolve(history);
        }
      });
    });
  },

  // Award points to user
  awardPointsToUser: (userId, points, reason = '') => {
    return new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET points = points + ? 
        WHERE id = ?
      `, [points, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          console.log(`💰 Awarded ${points} points to user ${userId} for: ${reason}`);
          resolve({ pointsAwarded: points, reason });
        }
      });
    });
  },

  // Complete activity and award organizer points
  completeActivity: (activityId, userId) => {
    return new Promise((resolve, reject) => {
      // First check if user is organizer
      db.get(`
        SELECT a.*, a.points_organizer 
        FROM activities a 
        WHERE a.id = ? AND a.organizer_id = ?
      `, [activityId, userId], (err, activity) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!activity) {
          reject(new Error('Activity not found or you are not the organizer'));
          return;
        }

        // Mark all participants as activity completed
        db.run(`
          UPDATE activity_participants 
          SET activity_completed = TRUE 
          WHERE activity_id = ?
        `, [activityId], (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Award points to organizer
          dbOperations.awardPointsToUser(userId, activity.points_organizer, 'Activity completion')
            .then(() => {
              console.log(`✅ Activity ${activityId} completed by organizer`);
              resolve({ 
                success: true, 
                message: `Activity completed! You earned ${activity.points_organizer} points!`,
                pointsEarned: activity.points_organizer
              });
            })
            .catch(reject);
        });
      });
    });
  },

  // Get leaderboard with real user data
  getLeaderboard: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          u.id,
          u.name,
          u.avatar,
          u.points,
          u.level,
          u.location,
          COUNT(DISTINCT ap.activity_id) as activitiesJoined,
          COUNT(DISTINCT a.id) as activitiesOrganized,
          COUNT(DISTINCT CASE WHEN ap.activity_completed = 1 THEN ap.activity_id END) as activitiesCompleted,
          COUNT(DISTINCT ar.id) as reviewsGiven,
          AVG(ar.rating) as averageRating
        FROM users u
        LEFT JOIN activity_participants ap ON u.id = ap.user_id
        LEFT JOIN activities a ON u.id = a.organizer_id AND a.status = 'active'
        LEFT JOIN activity_reviews ar ON u.id = ar.user_id
        WHERE u.points > 0
        GROUP BY u.id, u.name, u.avatar, u.points, u.level, u.location
        ORDER BY u.points DESC, u.name ASC
        LIMIT 50
      `, [], (err, rows) => {
        if (err) {
          console.error('Error fetching leaderboard:', err);
          reject(err);
        } else {
          const leaderboard = rows.map((row, index) => {
            // Calculate user level based on points (every 1000 points = 1 level)
            const level = Math.max(1, Math.floor(row.points / 1000) + 1);
            
            // Generate badges based on user achievements
            const badges = [];
            if (row.activitiesCompleted >= 5) badges.push('Activity Champion');
            if (row.activitiesOrganized >= 3) badges.push('Community Organizer');
            if (row.reviewsGiven >= 10) badges.push('Helpful Reviewer');
            if (row.averageRating >= 4.5) badges.push('Quality Contributor');
            if (row.points >= 5000) badges.push('Points Master');
            if (row.points >= 10000) badges.push('Leaderboard Legend');
            if (badges.length === 0) badges.push('Newcomer');

            // Calculate monthly growth (simplified - using total points for now)
            const monthlyGrowth = Math.min(row.points, 500); // Cap at 500 for display
            
            return {
              id: row.id,
              name: row.name,
              avatar: row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=random`,
              points: row.points,
              level: level,
              activitiesCompleted: row.activitiesCompleted + row.activitiesOrganized, // Total activities
              location: row.location || 'Location not set',
              badges: badges,
              rank: index + 1,
              growth: `+${monthlyGrowth} pts this month`,
              activitiesJoined: row.activitiesJoined,
              activitiesOrganized: row.activitiesOrganized,
              reviewsGiven: row.reviewsGiven,
              averageRating: row.averageRating ? parseFloat(row.averageRating.toFixed(1)) : 0
            };
          });
          
          console.log(`✅ Generated leaderboard with ${leaderboard.length} users`);
          resolve(leaderboard);
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
