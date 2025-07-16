import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSite() {
  try {
    console.log('Creating default site...');
    
    const site = await prisma.site.create({
      data: {
        name: 'TAQA Site',
        code: 'TAQA-001',
        location: 'Default Location',
        status: 'active',
        coordinates: {
          latitude: 0,
          longitude: 0
        }
      }
    });

    console.log('Default site created with ID:', site.id);
    console.log('Add this ID to your .env file as DEFAULT_SITE_ID=', site.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Site already exists, fetching existing site...');
      const site = await prisma.site.findFirst({
        where: {
          code: 'TAQA-001'
        }
      });
      if (site) {
        console.log('Existing site ID:', site.id);
        console.log('Add this ID to your .env file as DEFAULT_SITE_ID=', site.id);
      }
    } else {
      console.error('Error seeding site:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedSite()
    .catch((error) => {
      console.error('Failed to seed site:', error);
      process.exit(1);
    });
} 