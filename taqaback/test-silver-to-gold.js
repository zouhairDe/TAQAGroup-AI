const { PrismaClient } = require('@prisma/client');
const { AIPredictionService } = require('./dist/src/core/services/ai-prediction-service.js');

async function testSilverToGoldProcessing() {
    const prisma = new PrismaClient();
    const aiService = new AIPredictionService();
    
    try {
        console.log('🧪 Testing Silver to Gold processing with detailed logging...\n');
        
        // Get Silver records
        const silverRecords = await prisma.silverAnomaliesClean.findMany({
            take: 2,
            orderBy: { id: 'asc' }
        });
        
        console.log(`📊 Found ${silverRecords.length} records in Silver layer\n`);
        
        // Prepare AI prediction batch
        const predictionBatch = silverRecords.map(record => ({
            anomaly_id: record.id,
            description: record.description,
            equipment_name: record.descriptionEquipement,
            equipment_id: record.numEquipement
        }));
        
        console.log('🤖 Sending to AI service:');
        console.log(JSON.stringify(predictionBatch, null, 2));
        
        // Get AI predictions
        const aiPredictions = await aiService.getPredictions(predictionBatch);
        
        console.log('\n✅ AI Response received:');
        console.log(`Status: ${aiPredictions.status}`);
        console.log(`Successful predictions: ${aiPredictions.batch_info.successful_predictions}`);
        console.log(`Failed predictions: ${aiPredictions.batch_info.failed_predictions}`);
        
        // Process each record
        for (let i = 0; i < silverRecords.length; i++) {
            const silverRecord = silverRecords[i];
            const predictionResult = aiPredictions.results[i];
            
            console.log(`\n📝 Processing record ${i + 1}:`);
            console.log(`  Silver ID: ${silverRecord.id}`);
            console.log(`  Equipment: ${silverRecord.numEquipement}`);
            
            if (predictionResult) {
                console.log(`  AI Prediction status: ${predictionResult.status}`);
                console.log(`  Reliability: ${predictionResult.predictions?.reliability?.score || 'N/A'}`);
                console.log(`  Availability: ${predictionResult.predictions?.availability?.score || 'N/A'}`);
                console.log(`  Process Safety: ${predictionResult.predictions?.process_safety?.score || 'N/A'}`);
                
                const fiabilite = predictionResult.predictions?.reliability?.score || 0;
                const disponibilite = predictionResult.predictions?.availability?.score || 0;
                const processSafety = predictionResult.predictions?.process_safety?.score || 0;
                const criticite = fiabilite + disponibilite + processSafety;
                
                let criticityLevel = 'Low';
                if (criticite >= 11) {
                    criticityLevel = 'Critical';
                } else if (criticite >= 8) {
                    criticityLevel = 'High';
                } else if (criticite >= 4) {
                    criticityLevel = 'Medium';
                }
                
                console.log(`  Calculated Criticité: ${criticite} (${criticityLevel})`);
                
                // Check if anomaly exists
                const existingAnomaly = await prisma.anomaly.findFirst({
                    where: {
                        equipmentIdentifier: silverRecord.numEquipement
                    }
                });
                
                console.log(`  Existing anomaly: ${existingAnomaly ? 'YES' : 'NO'}`);
                
                // Try to create/update
                const goldData = {
                    code: silverRecord.numEquipement,
                    title: silverRecord.description,
                    description: silverRecord.description,
                    severity: criticityLevel,
                    status: 'Active',
                    priority: 'Medium',
                    category: 'Operational',
                    origin: 'Silver Layer',
                    reportedById: 'system',
                    equipmentIdentifier: silverRecord.numEquipement,
                    fiabiliteIntegrite: fiabilite,
                    disponibilite,
                    processSafety,
                    criticite: criticite.toString(),
                    criticityLevel,
                    updatedAt: new Date()
                };
                
                try {
                    if (existingAnomaly) {
                        await prisma.anomaly.update({
                            where: { id: existingAnomaly.id },
                            data: goldData
                        });
                        console.log('  ✅ Updated existing anomaly');
                    } else {
                        const newAnomaly = await prisma.anomaly.create({
                            data: goldData
                        });
                        console.log(`  ✅ Created new anomaly: ${newAnomaly.id}`);
                    }
                } catch (dbError) {
                    console.log(`  ❌ Database error: ${dbError.message}`);
                }
            } else {
                console.log('  ❌ No AI prediction received');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSilverToGoldProcessing();
