-- MMT Cause Quest - Database Seed Data
-- Clear existing data
DELETE FROM activity_participants;
DELETE FROM bookings;
DELETE FROM activities;
DELETE FROM users;

-- Insert Users with passwords
INSERT INTO users (id, name, email, password, points, level, avatar, location, phone, preferences) VALUES
(1, 'Ritesh Roy', 'ritesh.roy@example.com', 'ritesh123', 150, 1, 
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
 'Bangalore, Karnataka', '+91 9876543210', 
 '{"interests": ["culture", "heritage", "farming"], "preferred_cities": ["Gaya", "Bangalore", "Patna"]}'),

(2, 'Meghana Kumari', 'meghana.kumari@example.com', 'meghana123', 275, 2,
 'https://images.unsplash.com/photo-1494790108755-2616b612b691?w=150&h=150&fit=crop&crop=face',
 'Delhi, Delhi', '+91 9876543211',
 '{"interests": ["environment", "marine life", "cleanliness"], "preferred_cities": ["Delhi", "Andaman", "Goa"]}'),

(3, 'Joy Thomas', 'joy.thomas@example.com', 'joy123', 450, 3,
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
 'Port Blair, Andaman', '+91 9876543212',
 '{"interests": ["environment", "marine conservation", "community service"], "preferred_cities": ["Port Blair", "Havelock", "Chennai"]}'),

(4, 'Deepak Kumar', 'deepak.kumar@example.com', 'deepak123', 680, 4,
 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
 'Gaya, Bihar', '+91 9876543213',
 '{"interests": ["farming", "agriculture", "rural development", "food"], "preferred_cities": ["Gaya", "Patna", "Delhi"]}'),

(5, 'Sanjana Sarma', 'sanjana.sarma@example.com', 'sanjana123', 320, 2,
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
 'Shillong, Meghalaya', '+91 9876543214',
 '{"interests": ["culture", "handicrafts", "northeast heritage", "entrepreneurship"], "preferred_cities": ["Shillong", "Delhi", "Mumbai"]}'),

(6, 'Ashish Ranjan', 'ashish.ranjan@example.com', 'ashish123', 590, 3,
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
 'Delhi, Delhi', '+91 9876543215',
 '{"interests": ["culture", "heritage", "exhibitions", "social work"], "preferred_cities": ["Delhi", "Kolkata", "Guwahati"]}');

-- Insert Bookings
-- User 1 (Ritesh Roy) - Bookings to Gaya
INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status) VALUES
(1, 'flight', 'Gaya', 'Bihar', '2024-08-28', '2024-08-28', '2024-08-28',
 '{"flight_number": "AI501", "departure_time": "14:30", "arrival_time": "16:45", "from": "Bangalore", "to": "Gaya", "passengers": 3, "seat_class": "Economy"}', 'confirmed'),

(1, 'hotel', 'Gaya', 'Bihar', '2024-08-28', '2024-08-28', '2024-09-01',
 '{"hotel_name": "Heritage Inn Gaya", "room_type": "Deluxe Family Room", "guests": 3, "includes_breakfast": true}', 'confirmed'),

(1, 'flight', 'Bangalore', 'Karnataka', '2024-09-01', '2024-09-01', '2024-09-01',
 '{"flight_number": "AI502", "departure_time": "18:15", "arrival_time": "20:30", "from": "Gaya", "to": "Bangalore", "passengers": 3, "seat_class": "Economy"}', 'confirmed');

-- User 2 (Meghana Kumari) - Bookings to Andaman
INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status) VALUES
(2, 'flight', 'Port Blair', 'Andaman and Nicobar Islands', '2024-09-03', '2024-09-03', '2024-09-03',
 '{"flight_number": "AI665", "departure_time": "10:20", "arrival_time": "13:45", "from": "Delhi", "to": "Port Blair", "passengers": 1, "seat_class": "Premium Economy"}', 'confirmed'),

(2, 'hotel', 'Havelock Island', 'Andaman and Nicobar Islands', '2024-09-03', '2024-09-03', '2024-09-07',
 '{"hotel_name": "Barefoot at Havelock", "room_type": "Beach Villa", "guests": 1, "includes_breakfast": true, "includes_dinner": true}', 'confirmed'),

(2, 'flight', 'Delhi', 'Delhi', '2024-09-07', '2024-09-07', '2024-09-07',
 '{"flight_number": "AI666", "departure_time": "15:30", "arrival_time": "18:50", "from": "Port Blair", "to": "Delhi", "passengers": 1, "seat_class": "Premium Economy"}', 'confirmed');

-- User 4 (Deepak Kumar) - Train booking
INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status) VALUES
(4, 'train', 'Delhi', 'Delhi', '2024-10-02', '2024-10-02', '2024-10-02',
 '{"train_number": "12801", "train_name": "Purushottam Express", "departure_time": "22:15", "arrival_time": "10:30", "from": "Gaya", "to": "New Delhi", "passengers": 1, "seat_class": "3AC"}', 'confirmed');

-- User 5 (Sanjana Sarma) - Flight booking
INSERT INTO bookings (user_id, booking_type, destination_city, destination_state, booking_date, check_in_date, check_out_date, booking_details, status) VALUES
(5, 'flight', 'Delhi', 'Delhi', '2024-09-30', '2024-09-30', '2024-09-30',
 '{"flight_number": "AI871", "departure_time": "08:45", "arrival_time": "11:30", "from": "Shillong", "to": "Delhi", "passengers": 1, "seat_class": "Economy"}', 'confirmed');

-- Insert Activities (Updated dates to 2025 for testing)
INSERT INTO activities (title, description, location, city, state, date, time, organizer_id, max_participants, current_participants, category, requirements, status) VALUES
('Beach Cleanup Drive - Havelock Island', 
 'Join us for a meaningful beach cleanup initiative to preserve the pristine beauty of Havelock Island. Together, we can make a difference for marine life and future generations.',
 'Havelock Island', 'Havelock Island', 'Andaman and Nicobar Islands', '2024-09-05', '06:00', 3, 50, 1, 'Environment',
 'Comfortable clothing, sun protection, water bottle', 'active'),

('Heritage Farming Experience - Gaya',
 'Experience traditional farming methods and enjoy authentic local cuisine. Learn about sustainable agriculture while contributing to rural development.',
 'Rural Gaya', 'Gaya', 'Bihar', '2025-08-30', '10:00', 4, 15, 0, 'Agriculture',
 'Comfortable farm clothes, closed shoes', 'active'),

('Northeast Cultural Exhibition - Delhi',
 'Showcase the rich heritage and traditional clothing of Meghalaya. Support local artisans and promote northeast culture on a national platform.',
 'Pragati Maidan', 'Delhi', 'Delhi', '2025-08-31', '09:00', 6, 100, 1, 'Culture',
 'Interest in cultural heritage, formal attire preferred', 'active');

-- Insert Activity Participants
INSERT INTO activity_participants (activity_id, user_id, joined_at) VALUES
(1, 2, datetime('now')), -- Meghana joins Joy's beach cleanup
(3, 5, datetime('now')); -- Sanjana joins Ashish's cultural exhibition

-- Sample additional activities for demonstration
INSERT INTO activities (title, description, location, city, state, date, time, organizer_id, max_participants, current_participants, category, requirements, status) VALUES
('Street Food Culture Walk', 
 'Explore the authentic street food culture of Old Delhi while supporting local vendors and learning about traditional recipes.',
 'Chandni Chowk', 'Delhi', 'Delhi', '2025-08-29', '17:00', 1, 20, 5, 'Culture',
 'Empty stomach, comfortable walking shoes', 'active'),

('Mangrove Conservation Drive',
 'Help plant mangrove saplings and learn about coastal ecosystem preservation in the Sundarbans region.',
 'Sundarbans', 'Kolkata', 'West Bengal', '2024-09-10', '08:00', 2, 30, 12, 'Environment',
 'Sun protection, waterproof shoes, willingness to get muddy', 'active'),

('Traditional Handicraft Workshop',
 'Learn traditional handicraft techniques from local artisans while supporting rural livelihood programs.',
 'Craft Village', 'Udaipur', 'Rajasthan', '2024-09-15', '14:00', 3, 25, 8, 'Culture',
 'Interest in handicrafts, basic craft supplies provided', 'active'),

('Delhi Digital Heritage Documentation Drive',
 'Help document and preserve Delhi historical monuments using modern digital techniques. Perfect for tech enthusiasts who want to contribute to heritage preservation.',
 'Red Fort Complex', 'Delhi', 'Delhi', '2024-12-20', '09:00', 6, 20, 0, 'Heritage',
 'Smartphone with good camera, comfortable walking shoes, basic photography interest', 'active');
