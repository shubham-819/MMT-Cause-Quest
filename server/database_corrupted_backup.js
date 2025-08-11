const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in server directory
const dbPath = path.join(__dirname, 'mmt_cause_quest.db');
const db = new sqlite3.Database(dbPath);

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
          category TEXT,
          image TEXT,
          location_city TEXT,
          location_state TEXT,
          location_address TEXT,
          location_coordinates TEXT,
          date_time_start DATETIME,
          date_time_end DATETIME,
          duration INTEGER,
          capacity_min INTEGER,
          capacity_max INTEGER,
          organizer_id INTEGER,
          organizer_name TEXT,
          points_participant INTEGER DEFAULT 50,
          points_organizer INTEGER DEFAULT 100,
          status TEXT DEFAULT 'published',
          verification_status TEXT DEFAULT 'pending',
          verification_score INTEGER DEFAULT 0,
          requirements_guidelines TEXT,
          requirements_items TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Activity participants table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_participants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER,
          user_id INTEGER,
          user_name TEXT,
          status TEXT DEFAULT 'registered',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (activity_id) REFERENCES activities (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Activity reviews table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          activity_id INTEGER,
          user_name TEXT,
          user_avatar TEXT,
          rating INTEGER,
          comment TEXT,
          date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (activity_id) REFERENCES activities (id)
        )
      `);

      // Bookings table
      db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          booking_type TEXT, -- 'flight', 'hotel', 'cab', 'activity'
          destination_city TEXT,
          destination_state TEXT,
          booking_date TEXT,
          check_in_date TEXT,
          check_out_date TEXT,
          booking_details TEXT, -- JSON string with specific details
          status TEXT DEFAULT 'confirmed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Leaderboard table
      db.run(`
        CREATE TABLE IF NOT EXISTS leaderboard (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          user_name TEXT,
          avatar TEXT,
          points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          activities_completed INTEGER DEFAULT 0,
          location TEXT,
          badges TEXT,
          rank_position INTEGER,
          growth TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database tables initialized successfully');
          // Insert default demo user if not exists
          insertDefaultData();
          resolve();
        }
      });
    });
  });
};

// Insert default data for demo purposes
const insertDefaultData = () => {
  // Clear existing data first
  db.run("DELETE FROM bookings");
  db.run("DELETE FROM activity_participants");
  db.run("DELETE FROM users");
  db.run("DELETE FROM activities");

  // Insert 6 users with detailed profiles and passwords
  const users = [
    {
      name: 'Ritesh Roy',
      email: 'ritesh.roy@example.com',
      password: 'ritesh123',
      points: 150,
      level: 1,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      location: 'Bangalore, Karnataka',
      phone: '+91 9876543210',
      preferences: JSON.stringify({"interests": ["culture", "heritage", "farming"], "preferred_cities": ["Gaya", "Bangalore", "Patna"]})
    },
    {
      name: 'Meghana Kumari',
      email: 'meghana.kumari@example.com',
      password: 'meghana123',
      points: 275,
      level: 2,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b691?w=150&h=150&fit=crop&crop=face',
      location: 'Delhi, Delhi',
      phone: '+91 9876543211',
      preferences: JSON.stringify({"interests": ["environment", "marine life", "cleanliness"], "preferred_cities": ["Delhi", "Andaman", "Goa"]})
    },
    {
      name: 'Joy Thomas',
      email: 'joy.thomas@example.com',
      password: 'joy123',
      points: 450,
      level: 3,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      location: 'Port Blair, Andaman',
      phone: '+91 9876543212',
      preferences: JSON.stringify({"interests": ["environment", "marine conservation", "community service"], "preferred_cities": ["Port Blair", "Havelock", "Chennai"]})
    },
    {
      name: 'Deepak Kumar',
      email: 'deepak.kumar@example.com',
      password: 'deepak123',
      points: 680,
      level: 4,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      location: 'Gaya, Bihar',
      phone: '+91 9876543213',
      preferences: JSON.stringify({"interests": ["farming", "agriculture", "rural development", "food"], "preferred_cities": ["Gaya", "Patna", "Delhi"]})
    },
    {
      name: 'Sanjana Sarma',
      email: 'sanjana.sarma@example.com',
      password: 'sanjana123',
      points: 320,
      level: 2,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      location: 'Shillong, Meghalaya',
      phone: '+91 9876543214',
      preferences: JSON.stringify({"interests": ["culture", "handicrafts", "northeast heritage", "entrepreneurship"], "preferred_cities": ["Shillong", "Delhi", "Mumbai"]})
    },
    {
      name: 'Ashish Ranjan',
      email: 'ashish.ranjan@example.com',
      password: 'ashish123',
      points: 590,
      level: 3,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      location: 'Delhi, Delhi',
      phone: '+91 9876543215',
      preferences: JSON.stringify({"interests": ["culture", "heritage", "exhibitions", "social work"], "preferred_cities": ["Delhi", "Kolkata", "Guwahati"]})
    }
  ];

  users.forEach((user, index) => {
    db.run(`
      INSERT INTO users (name, email, password, points, level, avatar, location, phone, preferences)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user.name, user.email, user.password, user.points, user.level, user.avatar, user.location, user.phone, user.preferences], function(err) {
      if (err) {
        console.error('Error inserting user:', err);
      } else {
        console.log(`✅ Created user: ${user.name} with ID: ${this.lastID}`);
        
        // Insert bookings for specific users after user creation
        if (index === users.length - 1) {
          console.log('✅ All users created successfully');
        }
      }
    });
  });
};

// Insert sample data from SQL file
const insertSampleData = () => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const sqlFile = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL file by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    statements.forEach((statement, index) => {
      db.run(statement.trim(), function(err) {
        if (err) {
          console.error(`Error executing SQL statement ${index + 1}:`, err.message);
        }
      });
    });
    
    console.log('✅ Sample data loaded from seed.sql');
  } catch (error) {
    console.error('Error loading seed data:', error.message);
  }
};

// Call insertSampleData when initializing
const initializeDefaultData = () => {
  insertSampleData();
};

// Database operations
    {
      user_id: 1,
      booking_type: 'flight',
      destination_city: 'Gaya',
      destination_state: 'Bihar',
      booking_date: '2024-08-28',
      check_in_date: '2024-08-28',
      check_out_date: '2024-08-28',
      booking_details: JSON.stringify({
        airline: 'IndiGo',
        flight_number: '6E-237',
        departure: 'Bangalore (BLR)',
        arrival: 'Gaya (GAY)',
        departure_time: '08:30',
        arrival_time: '11:15',
        passengers: 3,
        class: 'Economy',
        price: 8500
      })
    },
        {
          user_id: 1,
          booking_type: 'hotel',
          destination_city: 'Goa',
          destination_state: 'Goa',
          booking_date: '2024-03-15',
          check_in_date: '2024-03-15',
          check_out_date: '2024-03-17',
          booking_details: JSON.stringify({
            hotel_name: 'Beach Resort Goa',
            room_type: 'Deluxe Sea View',
            guests: 1,
            nights: 2,
            price: 8000,
            amenities: ['Pool', 'Spa', 'Beach Access']
          })
        },
        {
          user_id: 1,
          booking_type: 'cab',
          destination_city: 'Goa',
          destination_state: 'Goa',
          booking_date: '2024-03-15',
          booking_details: JSON.stringify({
            service: 'Airport Transfer',
            pickup: 'Goa Airport',
            dropoff: 'Beach Resort Goa',
            vehicle_type: 'Sedan',
            price: 800
          })
        },
        {
          user_id: 1,
          booking_type: 'flight',
          destination_city: 'Delhi',
          destination_state: 'Delhi',
          booking_date: '2024-04-20',
          check_in_date: '2024-04-20',
          check_out_date: '2024-04-22',
          booking_details: JSON.stringify({
            airline: 'Air India',
            flight_number: 'AI-131',
            departure: 'Mumbai (BOM)',
            arrival: 'Delhi (DEL)',
            departure_time: '09:15',
            arrival_time: '11:30',
            passengers: 1,
            class: 'Business',
            price: 12000
          })
        },
        {
          user_id: 1,
          booking_type: 'hotel',
          destination_city: 'Delhi',
          destination_state: 'Delhi',
          booking_date: '2024-04-20',
          check_in_date: '2024-04-20',
          check_out_date: '2024-04-22',
          booking_details: JSON.stringify({
            hotel_name: 'The Imperial New Delhi',
            room_type: 'Premium Room',
            guests: 1,
            nights: 2,
            price: 15000,
            amenities: ['Spa', 'Restaurant', 'Gym']
          })
        }
      ];

      demoBookings.forEach(booking => {
        db.run(`
          INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [booking.user_id, booking.booking_type, booking.destination_city, booking.destination_state, booking.booking_date, booking.check_in_date, booking.check_out_date, booking.booking_details]);
      });
    }
  });

  // Insert sample activities if none exist
  db.get("SELECT COUNT(*) as count FROM activities", (err, row) => {
    if (row.count === 0) {
      const sampleActivities = [
        {
          title: 'Beach Cleanup Drive',
          short_description: 'Join us for a community beach cleanup in Goa. Help preserve marine life and enjoy the beach!',
          description: 'Join us for a comprehensive beach cleanup drive in beautiful Goa...',
          category: 'Environment',
          image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
          location_city: 'Goa',
          location_state: 'Goa',
          location_address: 'Baga Beach, North Goa',
          location_coordinates: JSON.stringify({ latitude: 15.5557, longitude: 73.7537 }),
          date_time_start: '2024-02-15T09:00:00.000Z',
          date_time_end: '2024-02-15T12:00:00.000Z',
          duration: 180,
          capacity_min: 5,
          capacity_max: 30,
          organizer_name: 'Green Warriors NGO',
          requirements_guidelines: 'Wear comfortable clothing and bring your own water bottle. Sun protection recommended.',
          requirements_items: JSON.stringify(['Water bottle', 'Sun hat', 'Comfortable shoes', 'Hand gloves'])
        },
        {
          title: 'Teaching Children at Local School',
          short_description: 'Volunteer to teach English and basic computer skills to underprivileged children.',
          description: 'Make a difference in the lives of underprivileged children by volunteering as a teacher...',
          category: 'Education',
          image: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400',
          location_city: 'Delhi',
          location_state: 'Delhi',
          location_address: 'Government Primary School, Karol Bagh',
          location_coordinates: JSON.stringify({ latitude: 28.6515, longitude: 77.1900 }),
          date_time_start: '2024-02-18T10:00:00.000Z',
          date_time_end: '2024-02-18T14:00:00.000Z',
          duration: 240,
          capacity_min: 3,
          capacity_max: 15,
          organizer_name: 'Shiksha Foundation',
          requirements_guidelines: 'Please bring educational materials if possible. Patience and enthusiasm required!',
          requirements_items: JSON.stringify(['Notebooks', 'Pens/Pencils', 'Teaching materials (optional)'])
        }
      ];

      sampleActivities.forEach(activity => {
        db.run(`
          INSERT INTO activities (
            title, short_description, description, category, image,
            location_city, location_state, location_address, location_coordinates,
            date_time_start, date_time_end, duration, capacity_min, capacity_max,
            organizer_name, requirements_guidelines, requirements_items
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          activity.title, activity.short_description, activity.description,
          activity.category, activity.image, activity.location_city,
          activity.location_state, activity.location_address, activity.location_coordinates,
          activity.date_time_start, activity.date_time_end, activity.duration,
          activity.capacity_min, activity.capacity_max, activity.organizer_name,
          activity.requirements_guidelines, activity.requirements_items
        ]);
      });
    }
  });

  // Initialize leaderboard with demo data
  db.get("SELECT COUNT(*) as count FROM leaderboard", (err, row) => {
    if (row.count === 0) {
      const leaderboardData = [
        {
          user_name: 'Priya Sharma',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9567afe?w=100',
          points: 2850,
          level: 5,
          activities_completed: 28,
          location: 'Mumbai, Maharashtra',
          badges: JSON.stringify(['Environment Champion', 'Community Leader', 'Travel Enthusiast']),
          rank_position: 1,
          growth: '+250 pts this month'
        },
        {
          user_name: 'Rahul Kumar',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          points: 2640,
          level: 4,
          activities_completed: 24,
          location: 'Delhi, Delhi',
          badges: JSON.stringify(['Education Advocate', 'Green Warrior']),
          rank_position: 2,
          growth: '+180 pts this month'
        },
        {
          user_name: 'Demo User',
          avatar: '',
          points: 1647,
          level: 2,
          activities_completed: 12,
          location: 'Location not set',
          badges: JSON.stringify(['Newcomer']),
          rank_position: 8,
          growth: '+75 pts this month'
        }
      ];

      leaderboardData.forEach(user => {
        db.run(`
          INSERT INTO leaderboard (
            user_name, avatar, points, level, activities_completed,
            location, badges, rank_position, growth
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.user_name, user.avatar, user.points, user.level,
          user.activities_completed, user.location, user.badges,
          user.rank_position, user.growth
        ]);
      });
    }
  });
};

// Function to insert bookings and activities for specific users
const insertBookingsAndActivities = () => {
  console.log('📝 Inserting detailed bookings and activities...');

  // User 1 (Ritesh Roy) - Bookings to Gaya
  const riteshBookings = [
    {
      user_id: 1,
      booking_type: 'flight',
      destination_city: 'Gaya',
      destination_state: 'Bihar',
      booking_date: '2024-08-28',
      check_in_date: '2024-08-28',
      check_out_date: '2024-08-28',
      booking_details: JSON.stringify({
        airline: 'IndiGo',
        flight_number: '6E-237',
        departure: 'Bangalore (BLR)',
        arrival: 'Gaya (GAY)',
        departure_time: '08:30',
        arrival_time: '11:15',
        passengers: 3,
        class: 'Economy',
        price: 8500
      })
    },
    {
      user_id: 1,
      booking_type: 'hotel',
      destination_city: 'Gaya',
      destination_state: 'Bihar',
      booking_date: '2024-08-28',
      check_in_date: '2024-08-28',
      check_out_date: '2024-09-01',
      booking_details: JSON.stringify({
        hotel_name: 'Gaya Heritage Hotel',
        room_type: 'Family Suite',
        guests: 3,
        nights: 4,
        price: 12000,
        amenities: ['Restaurant', 'Heritage Tours', 'Local Cuisine']
      })
    },
    {
      user_id: 1,
      booking_type: 'flight',
      destination_city: 'Bangalore',
      destination_state: 'Karnataka',
      booking_date: '2024-09-01',
      check_in_date: '2024-09-01',
      check_out_date: '2024-09-01',
      booking_details: JSON.stringify({
        airline: 'Air India',
        flight_number: 'AI-865',
        departure: 'Gaya (GAY)',
        arrival: 'Bangalore (BLR)',
        departure_time: '16:30',
        arrival_time: '19:45',
        passengers: 3,
        class: 'Economy',
        price: 9200
      })
    }
  ];

  // User 2 (Meghana Kumari) - Bookings to Andaman
  const meghanaBookings = [
    {
      user_id: 2,
      booking_type: 'flight',
      destination_city: 'Port Blair',
      destination_state: 'Andaman',
      booking_date: '2024-09-03',
      check_in_date: '2024-09-03',
      check_out_date: '2024-09-03',
      booking_details: JSON.stringify({
        airline: 'Vistara',
        flight_number: 'UK-749',
        departure: 'Delhi (DEL)',
        arrival: 'Port Blair (IXZ)',
        departure_time: '10:20',
        arrival_time: '13:45',
        passengers: 1,
        class: 'Premium Economy',
        price: 15000
      })
    },
    {
      user_id: 2,
      booking_type: 'hotel',
      destination_city: 'Havelock Island',
      destination_state: 'Andaman',
      booking_date: '2024-09-03',
      check_in_date: '2024-09-03',
      check_out_date: '2024-09-07',
      booking_details: JSON.stringify({
        hotel_name: 'Barefoot Resort Havelock',
        room_type: 'Beach Villa',
        guests: 1,
        nights: 4,
        price: 25000,
        amenities: ['Private Beach', 'Spa', 'Water Sports', 'Eco-friendly']
      })
    },
    {
      user_id: 2,
      booking_type: 'flight',
      destination_city: 'Delhi',
      destination_state: 'Delhi',
      booking_date: '2024-09-07',
      check_in_date: '2024-09-07',
      check_out_date: '2024-09-07',
      booking_details: JSON.stringify({
        airline: 'Vistara',
        flight_number: 'UK-750',
        departure: 'Port Blair (IXZ)',
        arrival: 'Delhi (DEL)',
        departure_time: '14:30',
        arrival_time: '17:55',
        passengers: 1,
        class: 'Premium Economy',
        price: 15000
      })
    }
  ];

  // User 4 (Deepak Kumar) - Train booking
  const deepakBookings = [
    {
      user_id: 4,
      booking_type: 'train',
      destination_city: 'Delhi',
      destination_state: 'Delhi',
      booking_date: '2024-10-02',
      check_in_date: '2024-10-02',
      check_out_date: '2024-10-02',
      booking_details: JSON.stringify({
        train_name: 'Mahabodhi Express',
        train_number: '12398',
        departure: 'Gaya Junction',
        arrival: 'New Delhi',
        departure_time: '06:00',
        arrival_time: '19:30',
        passengers: 1,
        class: 'AC 2 Tier',
        price: 2800
      })
    }
  ];

  // User 5 (Sanjana Sarma) - Flight from Shillong
  const sanjanaBookings = [
    {
      user_id: 5,
      booking_type: 'flight',
      destination_city: 'Delhi',
      destination_state: 'Delhi',
      booking_date: '2024-09-30',
      check_in_date: '2024-09-30',
      check_out_date: '2024-09-30',
      booking_details: JSON.stringify({
        airline: 'IndiGo',
        flight_number: '6E-742',
        departure: 'Shillong Airport (SHL)',
        arrival: 'Delhi (DEL)',
        departure_time: '12:15',
        arrival_time: '14:30',
        passengers: 1,
        class: 'Economy',
        price: 7800
      })
    }
  ];

  // Insert all bookings
  const allBookings = [...riteshBookings, ...meghanaBookings, ...deepakBookings, ...sanjanaBookings];
  
  allBookings.forEach(booking => {
    db.run(`
      INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `, [booking.user_id, booking.booking_type, booking.destination_city, booking.destination_state, booking.booking_date, booking.check_in_date, booking.check_out_date, booking.booking_details], function(err) {
      if (err) {
        console.error('Error inserting booking:', err);
      } else {
        console.log(`✅ Created booking for user ${booking.user_id}: ${booking.booking_type} to ${booking.destination_city}`);
      }
    });
  });

  // Create activities by organizers
  const activities = [
    // User 3 (Joy Thomas) - Cleanliness drive in Andaman
    {
      title: 'Marine Conservation & Beach Cleanup Drive',
      shortDescription: 'Join our 3-day marine conservation program in Havelock Island to protect coral reefs and clean beaches.',
      description: 'Experience the pristine beauty of Havelock Island while contributing to marine conservation. This comprehensive 3-day program includes beach cleanup drives, coral reef awareness sessions, and sustainable tourism practices. Work alongside marine biologists and local conservationists to protect one of India\'s most beautiful marine ecosystems. Activities include underwater cleanup (for certified divers), beach cleanup, awareness campaigns, and community interaction with local fishermen.',
      category: 'Environment',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      locationCity: 'Havelock Island',
      locationState: 'Andaman',
      locationAddress: 'Radhanagar Beach, Havelock Island',
      dateTimeStart: '2024-09-04T09:00:00.000Z',
      dateTimeEnd: '2024-09-06T17:00:00.000Z',
      duration: 480,
      capacityMin: 10,
      capacityMax: 25,
      organizerId: 3,
      organizerName: 'Joy Thomas',
      pointsParticipant: 150,
      pointsOrganizer: 300,
      requirementsGuidelines: 'Basic swimming knowledge preferred. Bring reef-safe sunscreen, reusable water bottle, and comfortable beach wear.',
      requirementsItems: JSON.stringify(['Reef-safe sunscreen', 'Reusable water bottle', 'Beach wear', 'Snorkeling gear (optional)'])
    },
    // User 4 (Deepak Kumar) - Farming activity in Gaya
    {
      title: 'Traditional Farming Experience & Local Cuisine Journey',
      shortDescription: 'Experience authentic wheat farming, traditional agricultural methods, and savor local Bihari cuisine in rural Gaya.',
      description: 'Immerse yourself in the rich agricultural heritage of Bihar through hands-on wheat farming experience. Learn traditional farming techniques passed down through generations, participate in sowing, harvesting, and grain processing. The experience includes interaction with local farmers, understanding sustainable farming practices, and enjoying authentic Bihari cuisine prepared with farm-fresh ingredients. Daily sessions run from 10 AM to 1 PM, followed by traditional lunch featuring litti-chokha, sattu, and other regional specialties.',
      category: 'Culture',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      locationCity: 'Gaya',
      locationState: 'Bihar',
      locationAddress: 'Deepak Farms, Village Sherghati, Gaya',
      dateTimeStart: '2024-08-15T10:00:00.000Z',
      dateTimeEnd: '2024-09-30T13:00:00.000Z',
      duration: 180,
      capacityMin: 5,
      capacityMax: 15,
      organizerId: 4,
      organizerName: 'Deepak Kumar',
      pointsParticipant: 100,
      pointsOrganizer: 200,
      requirementsGuidelines: 'Wear comfortable clothes suitable for farm work. Bring hat, water bottle, and enthusiasm to learn!',
      requirementsItems: JSON.stringify(['Comfortable farming clothes', 'Hat/Cap', 'Water bottle', 'Sunscreen'])
    },
    // User 6 (Ashish Ranjan) - Northeast Culture Exhibition
    {
      title: 'Exhibition to Northeast Culture - Clothing of Meghalaya - Brand Making',
      shortDescription: 'Discover and promote Meghalaya\'s traditional clothing heritage through a comprehensive cultural exhibition and brand development workshop.',
      description: 'A transformative 2-week exhibition and workshop focused on preserving and promoting the rich textile heritage of Meghalaya. Participants will learn about traditional Khasi, Jaintia, and Garo clothing patterns, weaving techniques, and their cultural significance. The program includes hands-on workshops with local artisans, business development sessions for aspiring entrepreneurs, and a public exhibition showcasing traditional and contemporary adaptations. Special focus on sustainable fashion, ethical sourcing, and creating market opportunities for Northeast artisans. Perfect for fashion enthusiasts, cultural preservationists, and social entrepreneurs.',
      category: 'Culture',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      locationCity: 'Delhi',
      locationState: 'Delhi',
      locationAddress: 'India Habitat Centre, Lodhi Road, New Delhi',
      dateTimeStart: '2024-10-02T10:00:00.000Z',
      dateTimeEnd: '2024-10-15T18:00:00.000Z',
      duration: 480,
      capacityMin: 20,
      capacityMax: 50,
      organizerId: 6,
      organizerName: 'Ashish Ranjan',
      pointsParticipant: 200,
      pointsOrganizer: 400,
      requirementsGuidelines: 'Interest in culture and fashion required. Some sessions involve hands-on work. Business mindset beneficial.',
      requirementsItems: JSON.stringify(['Notebook', 'Camera/Phone', 'Business cards (if available)', 'Comfortable clothes for workshops'])
    }
  ];

  activities.forEach(activity => {
    db.run(`
      INSERT INTO activities (
        title, short_description, description, category, image,
        location_city, location_state, location_address, location_coordinates,
        date_time_start, date_time_end, duration, capacity_min, capacity_max,
        organizer_id, organizer_name, points_participant, points_organizer,
        requirements_guidelines, requirements_items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      activity.title, activity.shortDescription, activity.description, activity.category, activity.image,
      activity.locationCity, activity.locationState, activity.locationAddress, '{}',
      activity.dateTimeStart, activity.dateTimeEnd, activity.duration, activity.capacityMin, activity.capacityMax,
      activity.organizerId, activity.organizerName, activity.pointsParticipant, activity.pointsOrganizer,
      activity.requirementsGuidelines, activity.requirementsItems
    ], function(err) {
      if (err) {
        console.error('Error inserting activity:', err);
      } else {
        console.log(`✅ Created activity: ${activity.title} by ${activity.organizerName}`);
        
        // Add activity participants
        if (activity.title.includes('Marine Conservation')) {
          // Meghana joins Joy's activity
          db.run(`
            INSERT INTO activity_participants (activity_id, user_id, user_name, joined_at, status)
            VALUES (?, 2, 'Meghana Kumari', CURRENT_TIMESTAMP, 'registered')
          `, [this.lastID]);
        }
        if (activity.title.includes('Northeast Culture')) {
          // Sanjana joins Ashish's activity
          db.run(`
            INSERT INTO activity_participants (activity_id, user_id, user_name, joined_at, status)
            VALUES (?, 5, 'Sanjana Sarma', CURRENT_TIMESTAMP, 'registered')
          `, [this.lastID]);
        }
      }
    });
  });

  console.log('✅ All detailed user data inserted successfully!');
};

// Database operations
const dbOperations = {
  // Get all activities
  getAllActivities: (filters = {}) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT a.*,
          (SELECT COUNT(*) FROM activity_participants ap WHERE ap.activity_id = a.id) as registered_count
        FROM activities a
        WHERE 1=1
      `;
      const params = [];

      if (filters.category) {
        query += ' AND a.category = ?';
        params.push(filters.category);
      }

      if (filters.city) {
        query += ' AND a.location_city LIKE ?';
        params.push(`%${filters.city}%`);
      }

      if (filters.search) {
        query += ' AND (a.title LIKE ? OR a.description LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      query += ' ORDER BY a.created_at DESC';

      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const activities = rows.map(row => ({
            id: row.id,
            title: row.title,
            shortDescription: row.short_description,
            description: row.description,
            category: row.category,
            image: row.image,
            location: {
              city: row.location_city,
              state: row.location_state,
              address: row.location_address,
              coordinates: JSON.parse(row.location_coordinates || '{}')
            },
            dateTime: {
              start: new Date(row.date_time_start),
              end: new Date(row.date_time_end)
            },
            duration: row.duration,
            capacity: {
              min: row.capacity_min,
              max: row.capacity_max
            },
            organizer: {
              id: row.organizer_id,
              name: row.organizer_name
            },
            pointsAwarded: {
              participant: row.points_participant,
              organizer: row.points_organizer
            },
            status: row.status,
            verification: {
              status: row.verification_status,
              temScore: row.verification_score
            },
            registeredParticipants: [], // Will be populated separately if needed
            rating: { average: 0, count: 0 }, // Will be calculated from reviews
            reviews: [], // Will be populated separately if needed
            requirements: {
              guidelines: row.requirements_guidelines,
              items: JSON.parse(row.requirements_items || '[]')
            }
          }));
          resolve(activities);
        }
      });
    });
  },

  // Get activity by ID
  getActivityById: (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM activities WHERE id = ?', [id], async (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          try {
            // Get participants
            const participants = await dbOperations.getActivityParticipants(id);
            // Get reviews
            const reviews = await dbOperations.getActivityReviews(id);
            
            const activity = {
              id: row.id,
              title: row.title,
              shortDescription: row.short_description,
              description: row.description,
              category: row.category,
              image: row.image,
              location: {
                city: row.location_city,
                state: row.location_state,
                address: row.location_address,
                coordinates: JSON.parse(row.location_coordinates || '{}')
              },
              dateTime: {
                start: new Date(row.date_time_start),
                end: new Date(row.date_time_end)
              },
              duration: row.duration,
              capacity: {
                min: row.capacity_min,
                max: row.capacity_max
              },
              organizer: {
                id: row.organizer_id,
                name: row.organizer_name
              },
              pointsAwarded: {
                participant: row.points_participant,
                organizer: row.points_organizer
              },
              status: row.status,
              verification: {
                status: row.verification_status,
                temScore: row.verification_score
              },
              registeredParticipants: participants,
              rating: { 
                average: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0, 
                count: reviews.length 
              },
              reviews: reviews,
              requirements: {
                guidelines: row.requirements_guidelines,
                items: JSON.parse(row.requirements_items || '[]')
              }
            };
            resolve(activity);
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  },

  // Create new activity
  createActivity: (activityData) => {
    return new Promise((resolve, reject) => {
      const {
        title, shortDescription, description, category, tags, location,
        dateTime, duration, capacity, requirements, impact, pointsAwarded, image
      } = activityData;

      // Use uploaded image or default fallback
      const imageUrl = image || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400';

      db.run(`
        INSERT INTO activities (
          title, short_description, description, category, image,
          location_city, location_state, location_address, location_coordinates,
          date_time_start, date_time_end, duration, capacity_min, capacity_max,
          organizer_id, organizer_name, points_participant, points_organizer,
          requirements_guidelines, requirements_items
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        title, shortDescription, description, category, imageUrl,
        location.city, location.state, location.address, JSON.stringify(location.coordinates || {}),
        new Date(dateTime.start).toISOString(), new Date(dateTime.end).toISOString(), duration,
        capacity.min, capacity.max, 1, 'Demo User',
        pointsAwarded.participant, pointsAwarded.organizer,
        requirements.guidelines, JSON.stringify(requirements.items || [])
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          // Award points to organizer for creating activity
          dbOperations.awardPointsToUser('Demo User', pointsAwarded.organizer, 'Activity created');
          resolve({ id: this.lastID, ...activityData });
        }
      });
    });
  },

  // Get activity participants
  getActivityParticipants: (activityId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM activity_participants WHERE activity_id = ?', [activityId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const participants = rows.map(row => ({
            user: {
              id: row.user_id,
              name: row.user_name
            },
            status: row.status
          }));
          resolve(participants);
        }
      });
    });
  },

  // Get activity reviews
  getActivityReviews: (activityId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM activity_reviews WHERE activity_id = ?', [activityId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const reviews = rows.map(row => ({
            id: row.id,
            user: {
              name: row.user_name,
              avatar: row.user_avatar
            },
            rating: row.rating,
            comment: row.comment,
            date: row.date
          }));
          resolve(reviews);
        }
      });
    });
  },

  // Join activity
  joinActivity: (activityId, userId, userName) => {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO activity_participants (activity_id, user_id, user_name, status)
        VALUES (?, ?, ?, 'registered')
      `, [activityId, userId, userName], function(err) {
        if (err) {
          reject(err);
        } else {
          // Get activity points and award to user
          db.get('SELECT points_participant FROM activities WHERE id = ?', [activityId], (err, row) => {
            if (!err && row) {
              dbOperations.awardPointsToUser(userName, row.points_participant, 'Activity joined');
            }
          });
          resolve({ success: true });
        }
      });
    });
  },

  // Award points to user and update leaderboard
  awardPointsToUser: (userName, points, reason) => {
    return new Promise((resolve, reject) => {
      // Update or insert into leaderboard
      db.get('SELECT * FROM leaderboard WHERE user_name = ?', [userName], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Update existing entry
          const newPoints = row.points + points;
          const newLevel = Math.floor(newPoints / 1000) + 1;
          db.run(`
            UPDATE leaderboard 
            SET points = ?, level = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_name = ?
          `, [newPoints, newLevel, userName], (err) => {
            if (err) reject(err);
            else resolve({ success: true, totalPoints: newPoints, level: newLevel });
          });
        } else {
          // Create new entry
          db.run(`
            INSERT INTO leaderboard (user_name, points, level, activities_completed, location, badges, rank_position, growth)
            VALUES (?, ?, ?, 0, 'Location not set', '["Newcomer"]', 999, '+${points} pts this month')
          `, [userName, points, Math.floor(points / 1000) + 1], (err) => {
            if (err) reject(err);
            else resolve({ success: true, totalPoints: points, level: Math.floor(points / 1000) + 1 });
          });
        }
      });
    });
  },

  // Get leaderboard
  getLeaderboard: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM leaderboard ORDER BY points DESC', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const leaderboard = rows.map((row, index) => ({
            id: row.id,
            name: row.user_name,
            avatar: row.avatar,
            points: row.points,
            level: row.level,
            activitiesCompleted: row.activities_completed,
            location: row.location,
            badges: JSON.parse(row.badges || '[]'),
            rank: index + 1,
            growth: row.growth
          }));
          resolve(leaderboard);
        }
      });
    });
  },

  // Get user by ID
  getUserById: (userId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            id: row.id,
            name: row.name,
            email: row.email,
            avatar: row.avatar,
            phone: row.phone,
            location: row.location,
            preferences: JSON.parse(row.preferences || '{}'),
            points: row.points,
            level: row.level,
            created_at: row.created_at
          });
        } else {
          resolve(null);
        }
      });
    });
  },

  // Get user bookings
  getUserBookings: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const bookings = rows.map(row => ({
            id: row.id,
            bookingType: row.booking_type,
            destinationCity: row.destination_city,
            destinationState: row.destination_state,
            bookingDate: row.booking_date,
            checkInDate: row.check_in_date,
            checkOutDate: row.check_out_date,
            details: JSON.parse(row.booking_details || '{}'),
            status: row.status,
            createdAt: row.created_at
          }));
          resolve(bookings);
        }
      });
    });
  },

  // Get activity suggestions based on user's bookings
  getActivitySuggestions: (userId) => {
    return new Promise((resolve, reject) => {
      // Get user's booking destinations
      db.all('SELECT DISTINCT destination_city, destination_state FROM bookings WHERE user_id = ?', [userId], (err, destinations) => {
        if (err) {
          reject(err);
          return;
        }

        if (destinations.length === 0) {
          resolve([]);
          return;
        }

        // Build query to find activities in those destinations
        const cityConditions = destinations.map(() => '(a.location_city = ? OR a.location_state = ?)').join(' OR ');
        const params = [];
        destinations.forEach(dest => {
          params.push(dest.destination_city, dest.destination_state);
        });

        const query = `
          SELECT a.*, 
                 COUNT(p.id) as participant_count,
                 COUNT(r.id) as review_count,
                 AVG(r.rating) as average_rating
          FROM activities a
          LEFT JOIN activity_participants p ON a.id = p.activity_id
          LEFT JOIN activity_reviews r ON a.id = r.activity_id
          WHERE ${cityConditions}
          GROUP BY a.id
          ORDER BY a.created_at DESC
          LIMIT 10
        `;

        db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const suggestions = rows.map(row => ({
              id: row.id,
              title: row.title,
              shortDescription: row.short_description,
              description: row.description,
              category: row.category,
              image: row.image,
              location: {
                city: row.location_city,
                state: row.location_state,
                address: row.location_address,
                coordinates: JSON.parse(row.location_coordinates || '{}')
              },
              dateTime: {
                start: row.date_time_start,
                end: row.date_time_end
              },
              duration: row.duration,
              capacity: {
                min: row.capacity_min,
                max: row.capacity_max
              },
              organizer: {
                id: row.organizer_id,
                name: row.organizer_name
              },
              pointsAwarded: {
                participant: row.points_participant,
                organizer: row.points_organizer
              },
              status: 'published',
              verification: { status: 'pending', temScore: 0 },
              registeredParticipants: [],
              rating: { average: row.average_rating || 0, count: row.review_count || 0 },
              reviews: [],
              requirements: {
                guidelines: row.requirements_guidelines,
                items: JSON.parse(row.requirements_items || '[]')
              }
            }));
            resolve(suggestions);
          }
        });
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
          const bookingsByType = {
            flights: [],
            hotels: [],
            cabs: [],
            activities: []
          };

          rows.forEach(row => {
            const booking = {
              id: row.id,
              type: row.booking_type,
              destination: {
                city: row.destination_city,
                state: row.destination_state
              },
              date: row.booking_date,
              checkIn: row.check_in_date,
              checkOut: row.check_out_date,
              details: JSON.parse(row.booking_details || '{}'),
              status: row.status,
              createdAt: row.created_at
            };

            if (bookingsByType[row.booking_type + 's']) {
              bookingsByType[row.booking_type + 's'].push(booking);
            }
          });

          resolve(bookingsByType);
        }
      });
    });
  },

  // Create user booking
  createBooking: (userId, bookingData) => {
    return new Promise((resolve, reject) => {
      const {
        type, destinationCity, destinationState, date, checkIn, checkOut, details, status = 'confirmed'
      } = bookingData;

      db.run(`
        INSERT INTO bookings (
          user_id, booking_type, destination_city, destination_state,
          booking_date, check_in_date, check_out_date, booking_details, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userId, type, destinationCity, destinationState,
        date, checkIn, checkOut, JSON.stringify(details), status
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...bookingData });
        }
      });
    });
  },

  // Update user profile
  updateUserProfile: (userId, profileData) => {
    return new Promise((resolve, reject) => {
      const { name, email, avatar } = profileData;
      
      db.run(`
        UPDATE users 
        SET name = ?, email = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, email, avatar, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: userId, ...profileData });
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
  },

  // Get user by email (for authentication)
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM users WHERE email = ?
      `, [email], (err, row) => {
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
          // Return the created user without password
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
  }
};

module.exports = {
  initializeDatabase,
  dbOperations,
  db
};
