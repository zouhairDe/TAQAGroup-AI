import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

interface MaintenancePeriod {
  title: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  durationHours: number;
}

function excelDateToJSDate(excelDate: number): Date {
  // Excel dates are number of days since Dec 30, 1899
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
}

async function importMaintenancePeriods() {
  try {
    const filePath = path.join(__dirname, '../Subject/Maintenace Windows and Actions Plan Template.xlsx');
    console.log('Reading file from:', filePath);

    const workbook = xlsx.readFile(filePath);
    console.log('Workbook sheets:', workbook.SheetNames);

    const sheetName = 'Maintenance Windows';
    console.log('Using sheet:', sheetName);

    const worksheet = workbook.Sheets[sheetName];
    const range = worksheet['!ref'];
    console.log('Worksheet range:', range);

    const rawData = xlsx.utils.sheet_to_json(worksheet);
    console.log('Raw data:', rawData);

    const periods: MaintenancePeriod[] = rawData.map((row: any) => {
      console.log('Processing row:', row);
      const startDate = excelDateToJSDate(row["Date début d'Arrét (Window)"]);
      const endDate = excelDateToJSDate(row["Date fin d'Arrét (Window)"]);

      return {
        title: `Période de maintenance ${startDate.toISOString().split('T')[0]}`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationDays: row['Durée en Jr'],
        durationHours: row['Durée en H']
      };
    });

    console.log('Found periods:', periods.length);
    console.log('Sample period:', periods[0]);

    // Clear existing maintenance periods
    await prisma.maintenancePeriod.deleteMany({});

    // Create new maintenance periods
    for (const period of periods) {
      await prisma.maintenancePeriod.create({
        data: {
          title: period.title,
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
          durationDays: period.durationDays,
          durationHours: period.durationHours,
          status: 'available',
          type: 'maintenance'
        }
      });
    }

    console.log(`Successfully imported ${periods.length} maintenance periods`);
  } catch (error) {
    console.error('Error importing maintenance periods:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  importMaintenancePeriods()
    .catch((error) => {
      console.error('Failed to import maintenance periods:', error);
      process.exit(1);
    });
} 