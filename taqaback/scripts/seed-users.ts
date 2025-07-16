import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding process...');
    
    // Users to create
    const users = [
      {
        email: 'admin@taqa.ma',
        role: 'admin',
        name: 'Admin User',
        password: 'admin123',
        profile: {
          department: 'IT',
          site: 'TAQA-MA',
          isFirstLogin: false
        }
      },
      {
        email: 'user1@taqa.ma',
        role: 'user',
        name: 'User One',
        password: 'user123',
        profile: {
          department: 'Production',
          site: 'TAQA-MA',
          isFirstLogin: true
        }
      },
      {
        email: 'user2@taqa.ma',
        role: 'user',
        name: 'User Two',
        password: 'user123',
        profile: {
          department: 'Maintenance',
          site: 'TAQA-MA',
          isFirstLogin: true
        }
      }
    ];

    console.log('📝 Creating users...');
    
    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists (ID: ${existingUser.id})`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with profile
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            role: userData.role,
            name: userData.name,
            password: hashedPassword,
            isActive: true,
            profile: {
              create: {
                department: userData.profile.department,
                site: userData.profile.site,
                isFirstLogin: userData.profile.isFirstLogin
              }
            }
          },
          include: {
            profile: true
          }
        });

        console.log(`✅ Created user: ${user.email} (ID: ${user.id})`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Department: ${user.profile?.department}`);
        console.log(`   - Site: ${user.profile?.site}`);
        console.log(`   - Password: ${userData.password}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    console.log('🎉 User seeding completed successfully!');
    console.log('');
    console.log('📋 Summary of created users:');
    console.log('1. admin@taqa.ma - Admin User (admin123)');
    console.log('2. user1@taqa.ma - User One (user123)');
    console.log('3. user2@taqa.ma - User Two (user123)');
    console.log('');
    console.log('⚠️  Please change default passwords after first login!');

  } catch (error) {
    console.error('❌ Error during user seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedUsers()
    .catch((error) => {
      console.error('Failed to seed users:', error);
      process.exit(1);
    });
}

export default seedUsers; 