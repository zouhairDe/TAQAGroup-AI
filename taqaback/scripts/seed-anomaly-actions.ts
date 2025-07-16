import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/fr';

const prisma = new PrismaClient();

const ACTION_TYPES = [
  'created',
  'assigned',
  'status_change',
  'maintenance',
  'comment',
  'attachment',
  'resolution',
  'ai_update',
  'impact_assessment'
] as const;

const STATUS_CHANGES = [
  'nouveau',
  'en_cours',
  'en_attente',
  'résolu',
  'fermé'
];

const PRIORITIES = [
  'basse',
  'moyenne',
  'haute',
  'critique'
];

const SEVERITIES = [
  'mineure',
  'modérée',
  'majeure',
  'critique'
];

async function generateActions(anomalyId: string, count: number = 10) {
  try {
    // First, verify the anomaly exists
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: anomalyId },
      include: {
        assignedTeam: true,
        assignedTo: true,
        reportedBy: true
      }
    });

    if (!anomaly) {
      throw new Error(`Anomaly with ID ${anomalyId} not found`);
    }

    // Get a random user for actions
    const users = await prisma.user.findMany({
      where: { isActive: true },
      take: 5
    });

    if (users.length === 0) {
      throw new Error('No active users found in the database');
    }

    // Get a random team
    const teams = await prisma.team.findMany({
      where: { isActive: true },
      take: 5
    });

    console.log(`Generating ${count} actions for anomaly ${anomalyId}...`);

    const actions = [];
    let currentStatus = 'nouveau';
    let currentPriority = 'moyenne';
    let currentSeverity = 'modérée';

    for (let i = 0; i < count; i++) {
      const actionType = ACTION_TYPES[Math.floor(Math.random() * ACTION_TYPES.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const team = teams[Math.floor(Math.random() * teams.length)];
      
      let title = '';
      let description = '';
      let metadata: any = {};
      let status = currentStatus;
      let priority = currentPriority;
      let severity = currentSeverity;

      switch (actionType) {
        case 'created':
          title = 'Anomalie créée';
          description = `Création de l'anomalie par ${user.name}`;
          break;

        case 'assigned':
          title = 'Assignation de l\'anomalie';
          description = `Assignée à ${team.name}`;
          metadata = { previousTeam: null, newTeam: team.id };
          break;

        case 'status_change':
          const newStatus = STATUS_CHANGES[Math.floor(Math.random() * STATUS_CHANGES.length)];
          title = 'Changement de statut';
          description = `Statut changé de ${currentStatus} à ${newStatus}`;
          metadata = { previousStatus: currentStatus, newStatus };
          currentStatus = newStatus;
          status = newStatus;
          break;

        case 'maintenance':
          title = 'Intervention de maintenance';
          description = faker.lorem.paragraph();
          metadata = {
            duration: faker.number.int({ min: 1, max: 8 }),
            maintenanceType: faker.helpers.arrayElement(['preventive', 'corrective']),
            tools: faker.helpers.arrayElements(['clé', 'tournevis', 'multimètre', 'oscilloscope'], { min: 1, max: 3 })
          };
          break;

        case 'comment':
          title = 'Nouveau commentaire';
          description = faker.lorem.paragraph();
          break;

        case 'attachment':
          title = 'Pièce jointe ajoutée';
          description = `Ajout du document: ${faker.system.fileName()}`;
          metadata = {
            fileName: faker.system.fileName(),
            fileType: faker.helpers.arrayElement(['pdf', 'jpg', 'png', 'doc']),
            fileSize: faker.number.int({ min: 100, max: 5000 })
          };
          break;

        case 'resolution':
          title = 'Résolution de l\'anomalie';
          description = faker.lorem.paragraph();
          status = 'résolu';
          currentStatus = 'résolu';
          break;

        case 'ai_update':
          title = 'Mise à jour IA';
          description = 'Analyse automatique effectuée';
          metadata = {
            confidence: faker.number.float({ min: 0.7, max: 0.99 }),
            suggestedCategory: faker.helpers.arrayElement(['électrique', 'mécanique', 'hydraulique']),
            riskScore: faker.number.float({ min: 0, max: 1 })
          };
          break;

        case 'impact_assessment':
          title = 'Évaluation d\'impact';
          description = faker.lorem.paragraph();
          metadata = {
            productionImpact: faker.number.float({ min: 0, max: 100 }),
            safetyRisk: faker.helpers.arrayElement(['low', 'medium', 'high']),
            estimatedCost: faker.number.float({ min: 1000, max: 50000 })
          };
          break;
      }

      const action = await prisma.anomalyAction.create({
        data: {
          anomalyId,
          type: actionType,
          title,
          description,
          metadata,
          performedById: user.id,
          teamId: team.id,
          status,
          priority,
          severity,
          category: faker.helpers.arrayElement(['technique', 'sécurité', 'environnement', 'production']),
          impact: {
            production: faker.number.float({ min: 0, max: 100 }),
            safety: faker.number.float({ min: 0, max: 100 }),
            cost: faker.number.float({ min: 1000, max: 50000 })
          },
          isAutomated: actionType === 'ai_update',
          aiConfidence: actionType === 'ai_update' ? faker.number.float({ min: 0.7, max: 0.99 }) : null,
          createdAt: faker.date.recent({ days: 30 })
        }
      });

      actions.push(action);
      console.log(`Created action: ${action.type} - ${action.title}`);
    }

    console.log(`Successfully created ${actions.length} actions`);
    return actions;

  } catch (error) {
    console.error('Error generating actions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Check if running from command line
if (require.main === module) {
  const anomalyId = process.argv[2];
  const count = parseInt(process.argv[3] || '10', 10);

  if (!anomalyId) {
    console.error('Please provide an anomaly ID as the first argument');
    process.exit(1);
  }

  generateActions(anomalyId, count)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to generate actions:', error);
      process.exit(1);
    });
}

export { generateActions }; 