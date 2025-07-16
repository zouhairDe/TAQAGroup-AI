import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to fix existing anomaly priority data
 * Converts old format (critical, high, medium, low) to new format (P1, P2, P3, P4)
 */
async function fixPriorityData() {
  console.log('🔄 Starting priority data migration...');
  
  try {
    // Get all anomalies with old priority format
    const anomalies = await prisma.anomaly.findMany({
      where: {
        priority: {
          in: ['critical', 'high', 'medium', 'low']
        }
      }
    });

    console.log(`📊 Found ${anomalies.length} anomalies with old priority format`);

    if (anomalies.length === 0) {
      console.log('✅ No anomalies need updating');
      return;
    }

    // Update each anomaly with correct priority format
    for (const anomaly of anomalies) {
      let newPriority: string;
      
      switch (anomaly.priority) {
        case 'critical':
          newPriority = 'P1';
          break;
        case 'high':
          newPriority = 'P2';
          break;
        case 'medium':
          newPriority = 'P3';
          break;
        case 'low':
          newPriority = 'P4';
          break;
        default:
          newPriority = 'P3'; // Default to medium
      }

      await prisma.anomaly.update({
        where: { id: anomaly.id },
        data: { 
          priority: newPriority,
          // Keep severity in original format for frontend compatibility
          severity: anomaly.priority 
        }
      });

      console.log(`✅ Updated anomaly ${anomaly.id}: ${anomaly.priority} → ${newPriority}`);
    }

    console.log(`🎉 Successfully updated ${anomalies.length} anomaly records`);

  } catch (error) {
    console.error('❌ Error updating priority data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  fixPriorityData()
    .then(() => {
      console.log('🏁 Priority data migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export { fixPriorityData }; 