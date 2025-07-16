const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3333';
const API_URL = `${BASE_URL}/api/v1`;

// Test manager user (this should exist in your database)
const TEST_MANAGER_ID = 'your-manager-user-id-here';

/**
 * Test the user creation endpoint
 */
async function testUserCreation() {
  console.log('🚀 Testing TAQA User Creation Endpoint');
  console.log('=====================================\n');

  try {
    // Step 1: Get available departments
    console.log('1. Getting available departments...');
    const departmentsResponse = await axios.get(`${API_URL}/users/departments`);
    console.log('✅ Departments:', departmentsResponse.data.data?.length || 0);
    
    if (departmentsResponse.data.data?.length > 0) {
      console.log('   Sample departments:');
      departmentsResponse.data.data.slice(0, 3).forEach(dept => {
        console.log(`   - ${dept.name} (${dept.code})`);
      });
    }

    // Step 2: Get available sites
    console.log('\n2. Getting available sites...');
    const sitesResponse = await axios.get(`${API_URL}/users/sites`);
    console.log('✅ Sites:', sitesResponse.data.data?.length || 0);
    
    if (sitesResponse.data.data?.length > 0) {
      console.log('   Sample sites:');
      sitesResponse.data.data.slice(0, 3).forEach(site => {
        console.log(`   - ${site.name} (${site.code})`);
      });
    }

    // Step 3: Create a test user
    console.log('\n3. Creating a test user...');
    
    const testUser = {
      email: `test.user.${Date.now()}@taqa.com`,
      fullName: 'Test User Ahmed',
      role: 'technician',
      password: 'TestPassword123!',
      phoneNumber: '+212 6 12 34 56 78',
      department: departmentsResponse.data.data?.[0]?.code || 'MAINTENANCE',
      site: sitesResponse.data.data?.[0]?.code || 'NOOR_OUARZAZATE',
      createdBy: TEST_MANAGER_ID,
      isActive: true
    };

    console.log('   Creating user with data:', {
      ...testUser,
      password: '****' // Hide password in logs
    });

    const createUserResponse = await axios.post(
      `${API_URL}/users/create-by-manager`,
      testUser
    );

    console.log('✅ User created successfully!');
    console.log('   User ID:', createUserResponse.data.data.id);
    console.log('   Profile ID:', createUserResponse.data.data.profile.id);
    console.log('   Email:', createUserResponse.data.data.email);
    console.log('   Department:', createUserResponse.data.data.profile.department);
    console.log('   Site:', createUserResponse.data.data.profile.site);

    // Step 4: Test validation errors
    console.log('\n4. Testing validation errors...');
    
    try {
      await axios.post(`${API_URL}/users/create-by-manager`, {
        ...testUser,
        email: testUser.email // Same email should fail
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Duplicate email validation works:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    try {
      await axios.post(`${API_URL}/users/create-by-manager`, {
        ...testUser,
        email: 'different.email@taqa.com',
        department: 'INVALID_DEPARTMENT'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Department validation works:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response.data.message?.includes('Creator user not found')) {
      console.log('\n💡 Tip: Make sure to update TEST_MANAGER_ID in the script with a valid manager user ID');
    }
  }
}

/**
 * Test user statistics endpoint
 */
async function testUserStats() {
  console.log('\n📊 Testing User Statistics Endpoint');
  console.log('===================================\n');

  try {
    const statsResponse = await axios.get(`${API_URL}/users/stats/overview`);
    console.log('✅ User statistics retrieved:');
    console.log('   Total users:', statsResponse.data.data.totalUsers);
    console.log('   Active users:', statsResponse.data.data.activeUsers);
    console.log('   Inactive users:', statsResponse.data.data.inactiveUsers);
    console.log('   Role distribution:', statsResponse.data.data.roleDistribution);
    console.log('   Site distribution:', statsResponse.data.data.siteDistribution);
  } catch (error) {
    console.error('❌ Stats test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log(`Testing against: ${API_URL}`);
  console.log(`Update TEST_MANAGER_ID to a valid manager user ID\n`);
  
  await testUserCreation();
  await testUserStats();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testUserCreation,
  testUserStats,
  runAllTests
}; 