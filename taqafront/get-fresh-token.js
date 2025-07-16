/**
 * Login and get a fresh token for testing
 */

const API_BASE_URL = 
'
http://10.30.249.128:3333/api/v1
'
;

async function loginAndGetToken() {
  console.log(
'
🔐 Logging in to get fresh token...\n
'
);

  try {
    // Login with admin credentials
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 
'
POST
'
,
      headers: {
        
'
Content-Type
'
: 
'
application/json
'

      },
      body: JSON.stringify({
        email: 
'
admin@taqa.ma
'
,
        password: 
'
password
'

      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    console.log(
'
✅ Login successful!
'
);
    console.log(
'
User:
'
, loginData.data.user.name);
    console.log(
'
Email:
'
, loginData.data.user.email);
    console.log(
'
Role:
'
, loginData.data.user.role);
    console.log(
'
\nJWT Token:
'
);
    console.log(loginData.data.token);
    
    return loginData.data.token;

  } catch (error) {
    console.error(
'
\n❌ Login failed:
'
, error.message);
    process.exit(1);
  }
}

loginAndGetToken();
