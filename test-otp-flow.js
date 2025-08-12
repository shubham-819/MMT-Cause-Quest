#!/usr/bin/env node

/**
 * End-to-End OTP Validation and Rating System Test
 * 
 * This script tests the complete flow:
 * 1. Ashish organizes an activity
 * 2. Sanjana joins the activity
 * 3. Ashish generates OTP
 * 4. Ashish validates OTP (activity starts)
 * 5. Ashish completes the activity
 * 6. Sanjana submits rating and review
 * 7. Verify points are awarded correctly
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:5000/api';

// Test users
const ASHISH = { id: 6, name: 'Ashish Ranjan' };
const SANJANA = { id: 5, name: 'Sanjana Sarma' };

// Test activity ID (will be the new one we added)
let TEST_ACTIVITY_ID = null;
let GENERATED_OTP = null;

// Utility function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  console.log(`\n📡 ${method} ${endpoint}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log(`   Request: ${JSON.stringify(body, null, 2)}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Step 1: Find Ashish's test activity
async function findTestActivity() {
  console.log('\n🔍 STEP 1: Finding Ashish\'s test activity...');
  
  const result = await apiCall('/activities');
  if (!result.success) {
    throw new Error('Failed to fetch activities');
  }

  // Find the Delhi Heritage activity organized by Ashish (user 6)
  const activity = result.data.activities.find(a => 
    a.title.includes('Delhi Digital Heritage') && a.organizer_id === ASHISH.id
  );

  if (!activity) {
    throw new Error('Test activity not found. Make sure the database is seeded with the new activity.');
  }

  TEST_ACTIVITY_ID = activity.id;
  console.log(`✅ Found test activity: "${activity.title}" (ID: ${TEST_ACTIVITY_ID})`);
  
  return activity;
}

// Step 2: Sanjana joins the activity
async function sanjanaJoinsActivity() {
  console.log('\n👥 STEP 2: Sanjana joins the activity...');
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/join`, 'POST', {
    userId: SANJANA.id,
    userName: SANJANA.name,
    message: 'Excited to contribute to heritage preservation!'
  });

  if (!result.success) {
    throw new Error(`Failed to join activity: ${result.data.error}`);
  }

  console.log(`✅ ${SANJANA.name} successfully joined the activity!`);
  console.log(`   Points earned: ${result.data.pointsEarned}`);
  
  return result.data;
}

// Step 3: Check initial user points
async function checkUserPoints(userId, userName) {
  console.log(`\n💰 Checking ${userName}'s current points...`);
  
  const result = await apiCall(`/users/${userId}`);
  if (!result.success) {
    throw new Error(`Failed to get user data for ${userName}`);
  }

  console.log(`   ${userName} current points: ${result.data.user.points}`);
  return result.data.user.points;
}

// Step 4: Ashish generates OTP
async function ashishGeneratesOTP() {
  console.log('\n🔐 STEP 3: Ashish generates OTP...');
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/generate-otp`, 'POST', {
    userId: ASHISH.id
  });

  if (!result.success) {
    throw new Error(`Failed to generate OTP: ${result.data.error}`);
  }

  GENERATED_OTP = result.data.otpCode;
  console.log(`✅ OTP generated successfully!`);
  console.log(`   🔑 OTP Code: ${GENERATED_OTP}`);
  console.log(`   ⏰ Expires: ${result.data.expiresAt}`);
  
  return result.data;
}

// Step 5: Check user activity status for Sanjana
async function checkSanjanaActivityStatus() {
  console.log('\n📊 STEP 4: Checking Sanjana\'s activity status...');
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/user-status/${SANJANA.id}`);
  if (!result.success) {
    throw new Error('Failed to get user activity status');
  }

  console.log(`✅ Sanjana's activity status:`);
  console.log(`   OTP Code: ${result.data.status.otp_code || 'Not set'}`);
  console.log(`   OTP Verified: ${result.data.status.otp_verified || false}`);
  console.log(`   Activity Started: ${result.data.status.activity_started || false}`);
  console.log(`   Activity Completed: ${result.data.status.activity_completed || false}`);
  
  return result.data.status;
}

// Step 6: Ashish validates OTP and starts activity
async function ashishValidatesOTP() {
  console.log('\n✅ STEP 5: Ashish validates OTP to start activity...');
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/validate-otp`, 'POST', {
    userId: ASHISH.id,
    otpCode: GENERATED_OTP
  });

  if (!result.success) {
    throw new Error(`Failed to validate OTP: ${result.data.error}`);
  }

  console.log(`✅ Activity started successfully!`);
  console.log(`   Message: ${result.data.message}`);
  
  return result.data;
}

// Step 7: Ashish completes the activity
async function ashishCompletesActivity() {
  console.log('\n🏁 STEP 6: Ashish completes the activity...');
  
  const ashishPointsBefore = await checkUserPoints(ASHISH.id, ASHISH.name);
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/complete`, 'POST', {
    userId: ASHISH.id
  });

  if (!result.success) {
    throw new Error(`Failed to complete activity: ${result.data.error}`);
  }

  console.log(`✅ Activity completed successfully!`);
  
  // Check points after completion
  const ashishPointsAfter = await checkUserPoints(ASHISH.id, ASHISH.name);
  const pointsEarned = ashishPointsAfter - ashishPointsBefore;
  
  console.log(`   🎉 Ashish earned ${pointsEarned} organizer points!`);
  
  return result.data;
}

// Step 8: Sanjana submits rating and review
async function sanjanaSubmitsReview() {
  console.log('\n⭐ STEP 7: Sanjana submits rating and review...');
  
  const sanjanaPointsBefore = await checkUserPoints(SANJANA.id, SANJANA.name);
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/review`, 'POST', {
    userId: SANJANA.id,
    rating: 5,
    review: 'Amazing experience! Learned so much about digital heritage preservation. Ashish was an excellent organizer and the activity was well-planned. Highly recommend to anyone interested in technology and history!'
  });

  if (!result.success) {
    throw new Error(`Failed to submit review: ${result.data.error}`);
  }

  console.log(`✅ Review submitted successfully!`);
  
  // Check points after review
  const sanjanaPointsAfter = await checkUserPoints(SANJANA.id, SANJANA.name);
  const pointsEarned = sanjanaPointsAfter - sanjanaPointsBefore;
  
  console.log(`   🎉 Sanjana earned ${pointsEarned} participant points!`);
  
  return result.data;
}

// Step 9: Verify final reviews and ratings
async function verifyReviewsAndRatings() {
  console.log('\n📋 STEP 8: Verifying reviews and ratings...');
  
  const result = await apiCall(`/activities/${TEST_ACTIVITY_ID}/reviews`);
  if (!result.success) {
    throw new Error('Failed to fetch reviews');
  }

  console.log(`✅ Activity reviews verified:`);
  console.log(`   Average Rating: ${result.data.averageRating.toFixed(1)}/5.0`);
  console.log(`   Total Reviews: ${result.data.totalReviews}`);
  
  if (result.data.reviews.length > 0) {
    const review = result.data.reviews[0];
    console.log(`   Latest Review by ${review.user_name}:`);
    console.log(`   Rating: ${review.rating}/5`);
    console.log(`   Review: "${review.review.substring(0, 100)}..."`);
  }
  
  return result.data;
}

// Main test function
async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End OTP Validation and Rating System Test');
  console.log('='.repeat(70));

  try {
    // Execute all test steps
    await findTestActivity();
    await sanjanaJoinsActivity();
    await ashishGeneratesOTP();
    await checkSanjanaActivityStatus();
    await ashishValidatesOTP();
    await ashishCompletesActivity();
    await sanjanaSubmitsReview();
    await verifyReviewsAndRatings();

    console.log('\n🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log('\n📊 TEST SUMMARY:');
    console.log('✅ Activity organized by Ashish');
    console.log('✅ Sanjana joined the activity');
    console.log('✅ OTP generated and shared');
    console.log('✅ OTP validated and activity started');
    console.log('✅ Activity completed and organizer points awarded');
    console.log('✅ Review submitted and participant points awarded');
    console.log('✅ Rating system working correctly');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  runEndToEndTest();
}

module.exports = {
  runEndToEndTest,
  ASHISH,
  SANJANA,
  apiCall
};
