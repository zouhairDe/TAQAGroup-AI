import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdminUser() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'admin',
        isActive: true
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists with ID:', existingAdmin.id);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@taqa.com',
        role: 'admin',
        name: 'Admin User',
        password: hashedPassword,
        isActive: true,
        profile: {
          create: {
            department: 'IT',
            site: 'TAQA-001',
            isFirstLogin: false
          }
        }
      }
    });

    console.log('Admin user created successfully with ID:', admin.id);
    console.log('Default credentials:');
    console.log('Email: admin@taqa.com');
    console.log('Password: admin123');
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedAdminUser()
    .catch((error) => {
      console.error('Failed to seed admin user:', error);
      process.exit(1);
    });
} 