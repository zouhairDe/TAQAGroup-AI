const { PrismaClient } = require('@prisma/client');

async function checkSilverData() {
    const prisma = new PrismaClient();
    
    try {
        console.log('Checking Silver layer data...');
        
        const silverRecords = await prisma.silverAnomaliesClean.findMany({
            take: 5,
            orderBy: { id: 'asc' }
        });
        
        console.log(`Found ${silverRecords.length} records in Silver layer:`);
        silverRecords.forEach((record, index) => {
            console.log(`\nRecord ${index + 1}:`);
            console.log(`  ID: ${record.id}`);
            console.log(`  numEquipement: ${record.numEquipement}`);
            console.log(`  description: ${record.description}`);
            console.log(`  descriptionEquipement: ${record.descriptionEquipement}`);
            console.log(`  dateDetectionAnomalie: ${record.dateDetectionAnomalie}`);
            console.log(`  sectionProprietaire: ${record.sectionProprietaire}`);
        });
        
        // Check Gold layer
        console.log('\n--- Checking Gold layer (Anomaly table) ---');
        const goldRecords = await prisma.anomaly.findMany({
            take: 5,
            orderBy: { id: 'asc' }
        });
        
        console.log(`Found ${goldRecords.length} records in Gold layer`);
        
    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSilverData();
