import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

// Helper function to create random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random elements from array
function randomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.kPIMetric.deleteMany();
  await prisma.rEXEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.slot.deleteMany();
  // await prisma.maintenancePeriod.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.anomaly.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.site.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create Departments
  console.log('🏢 Creating departments...');
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Operations',
        code: 'OPS',
        description: 'Operations and maintenance department',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Engineering',
        code: 'ENG',
        description: 'Engineering and technical department',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Safety',
        code: 'HSE',
        description: 'Health, Safety and Environment department',
        isActive: true
      }
    }),
    prisma.department.create({
      data: {
        name: 'Management',
        code: 'MGT',
        description: 'Management and administration',
        isActive: true
      }
    })
  ]);

  // 2. Create Sites
  console.log('🏭 Creating sites...');
  const sites = await Promise.all([
    prisma.site.create({
      data: {
        name: 'Noor Ouarzazate I',
        code: 'NO1',
        location: 'Ouarzazate, Morocco',
        capacity: '160 MW',
        status: 'operational',
        coordinates: { latitude: 30.9335, longitude: -6.9091 }
      }
    }),
    prisma.site.create({
      data: {
        name: 'Noor Ouarzazate II',
        code: 'NO2',
        location: 'Ouarzazate, Morocco',
        capacity: '200 MW',
        status: 'operational',
        coordinates: { latitude: 30.9335, longitude: -6.9091 }
      }
    }),
    prisma.site.create({
      data: {
        name: 'Noor Ouarzazate III',
        code: 'NO3',
        location: 'Ouarzazate, Morocco',
        capacity: '150 MW',
        status: 'operational',
        coordinates: { latitude: 30.9335, longitude: -6.9091 }
      }
    }),
    prisma.site.create({
      data: {
        name: 'Noor Midelt',
        code: 'NM1',
        location: 'Midelt, Morocco',
        capacity: '800 MW',
        status: 'operational',
        coordinates: { latitude: 32.6852, longitude: -4.7347 }
      }
    })
  ]);

  // 3. Create Zones
  console.log('🗺️ Creating zones...');
  const zones: any[] = [];
  for (const site of sites) {
    const siteZones = await Promise.all([
      prisma.zone.create({
        data: {
          name: `${site.name} - Solar Field`,
          code: `${site.code}-SF`,
          siteId: site.id,
          description: 'Solar field with mirrors and collectors'
        }
      }),
      prisma.zone.create({
        data: {
          name: `${site.name} - Power Block`,
          code: `${site.code}-PB`,
          siteId: site.id,
          description: 'Power generation block'
        }
      }),
      prisma.zone.create({
        data: {
          name: `${site.name} - Control Room`,
          code: `${site.code}-CR`,
          siteId: site.id,
          description: 'Control and monitoring room'
        }
      })
    ]);
    zones.push(...siteZones);
  }

  // 4. Create Users
  console.log('👥 Creating users...');
  const hashedPassword = await hash('password123', 10);
  
  const users = await Promise.all([
    // Management
    prisma.user.create({
      data: {
        email: 'ahmed.benali@taqa.ma',
        name: 'Ahmed Benali',
        role: 'manager',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'fatima.alaoui@taqa.ma',
        name: 'Fatima Alaoui',
        role: 'manager',
        password: hashedPassword,
        isActive: true
      }
    }),
    // Team Leaders
    prisma.user.create({
      data: {
        email: 'mohamed.idrissi@taqa.ma',
        name: 'Mohamed Idrissi',
        role: 'team_leader',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'aicha.zouani@taqa.ma',
        name: 'Aicha Zouani',
        role: 'team_leader',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'admin@taqa.ma',
        name: 'admin account',
        role: 'Website Admin',
        isActive: true,
        password: await hash('admin123', 10),
      }
    }),
    // Technicians
    prisma.user.create({
      data: {
        email: 'youssef.kamil@taqa.ma',
        name: 'Youssef Kamil',
        role: 'technician',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'khadija.amrani@taqa.ma',
        name: 'Khadija Amrani',
        role: 'technician',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'hassan.jabri@taqa.ma',
        name: 'Hassan Jabri',
        role: 'technician',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'nadia.fassi@taqa.ma',
        name: 'Nadia Fassi',
        role: 'technician',
        password: hashedPassword,
        isActive: true
      }
    }),
    // Operators
    prisma.user.create({
      data: {
        email: 'omar.benkirane@taqa.ma',
        name: 'Omar Benkirane',
        role: 'operator',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'sara.cherkaoui@taqa.ma',
        name: 'Sara Cherkaoui',
        role: 'operator',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'rachid.bennani@taqa.ma',
        name: 'Rachid Bennani',
        role: 'operator',
        password: hashedPassword,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'latifa.amini@taqa.ma',
        name: 'Latifa Amini',
        role: 'operator',
        password: hashedPassword,
        isActive: true
      }
    })
  ]);

  // Create user profiles
  console.log('👤 Creating user profiles...');
  const userProfiles = await Promise.all(users.map((user) => {
    const siteAssignments = ['Noor Ouarzazate I', 'Noor Ouarzazate II', 'Noor Ouarzazate III', 'Noor Midelt'];
    return prisma.userProfile.create({
      data: {
        userId: user.id,
        department: randomElement(['Operations', 'Engineering', 'Safety', 'Management']),
        site: randomElement(siteAssignments),
        phone: `+212 6${Math.floor(Math.random() * 90000000) + 10000000}`,
        isFirstLogin: false,
        lastLogin: randomDate(new Date('2024-01-01'), new Date())
      }
    });
  }));

  // 5. Create Teams
  console.log('👥 Creating teams...');
  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Maintenance Thermique',
        code: 'MT-001',
        type: 'maintenance',
        leadId: users[2].id, // Mohamed Idrissi
        specialties: ['Turbines', 'Générateurs', 'Chaudières'],
        location: 'Noor Ouarzazate I',
        isActive: true,
        rating: 4.5
      }
    }),
    prisma.team.create({
      data: {
        name: 'Maintenance Électrique',
        code: 'ME-001',
        type: 'maintenance',
        leadId: users[3].id, // Aicha Zouani
        specialties: ['Transformateurs', 'Onduleurs', 'Réseaux'],
        location: 'Noor Ouarzazate II',
        isActive: true,
        rating: 4.2
      }
    }),
    prisma.team.create({
      data: {
        name: 'Opérations Solaires',
        code: 'OS-001',
        type: 'operations',
        leadId: users[0].id, // Ahmed Benali
        specialties: ['Héliostats', 'Collecteurs', 'Contrôle'],
        location: 'Noor Midelt',
        isActive: true,
        rating: 4.8
      }
    }),
    prisma.team.create({
      data: {
        name: 'Ingénierie Procédés',
        code: 'IP-001',
        type: 'engineering',
        leadId: users[1].id, // Fatima Alaoui
        specialties: ['Analyse', 'Optimisation', 'Innovation'],
        location: 'Noor Ouarzazate III',
        isActive: true,
        rating: 4.6
      }
    }),
    prisma.team.create({
      data: {
        name: 'Sécurité HSE',
        code: 'HSE-001',
        type: 'safety',
        leadId: users[2].id, // Mohamed Idrissi
        specialties: ['Sécurité', 'Environnement', 'Audit'],
        location: 'Multi-sites',
        isActive: true,
        rating: 4.9
      }
    })
  ]);

  // Create team members
  console.log('👨‍👩‍👧‍👦 Creating team members...');
  const teamMembers: any[] = [];
  for (const team of teams) {
    const availableUsers = users.filter(u => u.role === 'technician' || u.role === 'operator');
    const membersCount = Math.floor(Math.random() * 4) + 2; // 2-5 members per team
    
    for (let i = 0; i < membersCount; i++) {
      const user = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      try {
        const member = await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: user.id,
            role: randomElement(['chef', 'senior', 'junior', 'apprenti']),
            skills: randomElements(['Mécanique', 'Électricité', 'Hydraulique', 'Soudure', 'Programmation', 'Instrumentation'], 3),
            experience: randomElement(['2 ans', '5 ans', '8 ans', '12 ans', '15 ans']),
            rating: 3.5 + Math.random() * 1.5 // 3.5-5.0
          }
        });
        teamMembers.push(member);
      } catch (error) {
        // Skip if user already in team
      }
    }
  }

  // 6. Create Equipment
  console.log('⚙️ Creating equipment...');
  const equipmentTypes = [
    { type: 'mechanical', categories: ['Turbine', 'Générateur', 'Pompe', 'Compresseur', 'Échangeur'] },
    { type: 'electrical', categories: ['Transformateur', 'Onduleur', 'Commutateur', 'Disjoncteur', 'Relais'] },
    { type: 'hydraulic', categories: ['Valve', 'Actuateur', 'Collecteur', 'Réservoir', 'Filtre'] },
    { type: 'instrumentation', categories: ['Capteur', 'Transmetteur', 'Analyseur', 'Régulateur', 'Indicateur'] }
  ];

  const equipment: any[] = [];
  for (const site of sites) {
    const siteZones = zones.filter(z => z.siteId === site.id);
    
    for (let i = 0; i < 25; i++) { // 25 equipment per site
      const typeData = randomElement(equipmentTypes);
      const category = randomElement(typeData.categories);
      
      const equip = await prisma.equipment.create({
        data: {
          name: `${category} ${site.code}-${String(i + 1).padStart(3, '0')}`,
          code: `${site.code}-${category.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(3, '0')}`,
          description: `${category} installé sur ${site.name}`,
          type: typeData.type,
          category: category.toLowerCase(),
          siteId: site.id,
          zoneId: randomElement(siteZones).id,
          status: randomElement(['operational', 'maintenance', 'warning', 'critical']),
          manufacturer: randomElement(['Siemens', 'ABB', 'Schneider', 'GE', 'Mitsubishi']),
          model: `Model-${Math.floor(Math.random() * 9000) + 1000}`,
          serialNumber: `SN${Math.floor(Math.random() * 900000) + 100000}`,
          installDate: randomDate(new Date('2020-01-01'), new Date('2023-12-31')),
          lastMaintenance: randomDate(new Date('2024-01-01'), new Date()),
          nextMaintenance: randomDate(new Date(), new Date('2024-12-31')),
          isActive: true
        }
      });
      equipment.push(equip);
    }
  }

  // 7. Create Anomalies
  console.log('🚨 Creating anomalies...');
  const anomalies: any[] = [];
  const anomalyCategories = ['mechanical', 'electrical', 'hydraulic', 'instrumentation', 'control'];
  const severities = ['critical', 'medium', 'low']; // Updated to 3-level system
  const statuses = ['open', 'in_progress', 'resolved', 'closed']; // Updated status names
  const priorities = {
    'critical': 'P1',
    'medium': 'P2', 
    'low': 'P3'
  }

  for (let i = 0; i < 150; i++) { // 150 anomalies
    const reportedAt = randomDate(new Date('2024-01-01'), new Date());
    const severity = randomElement(severities);
    const status = randomElement(statuses);
    const isResolved = status === 'resolved' || status === 'closed';
    const selectedEquipment = randomElement(equipment);
    
    // Generate additional required data
    const durationToResolve = Math.floor(Math.random() * 1000) + 1; // Random 1-1000 hours
    const estimatedCost = Math.floor(Math.random() * 50000) + 1000; // Random 1000-51000 MAD
    const downtimeHours = Math.floor(Math.random() * 48) + 1; // Random 1-48 hours
    const slaHours = severity === 'critical' ? 4 : severity === 'medium' ? 72 : 168; // New 3-level SLA
    
    const anomaly = await prisma.anomaly.create({
      data: {
        code: `ABO-2024-${String(i + 1).padStart(4, '0')}`,
        title: `Anomalie ${randomElement(['Pression', 'Température', 'Vibration', 'Tension', 'Courant', 'Débit'])} ${randomElement(['Élevée', 'Faible', 'Instable', 'Critique'])}`,
        description: `Détection d'une anomalie sur l'équipement. ${randomElement(['Valeurs hors limites', 'Comportement anormal', 'Défaillance détectée', 'Déviation du processus'])}.`,
        equipmentId: selectedEquipment.id,
        equipmentIdentifier: selectedEquipment.code,
        severity,
        status,
        priority: priorities[severity],
        category: randomElement(anomalyCategories),
        origin: randomElement(['manual', 'iot', 'oracle', 'inspection']),
        assignedToId: status !== 'open' ? randomElement(users).id : null,
        assignedTeamId: status !== 'open' ? randomElement(teams).id : null,
        reportedById: randomElement(users).id,
        reportedAt,
        safetyImpact: severity === 'critical', // Critical anomalies have safety impact
        environmentalImpact: severity === 'critical', // Critical anomalies have environmental impact
        productionImpact: severity !== 'low', // All except low have production impact
        estimatedCost,
        actualCost: isResolved ? Math.random() * 45000 + 1000 : null,
        downtimeHours,
        durationToResolve,
        slaHours,
        dueDate: new Date(reportedAt.getTime() + slaHours * 60 * 60 * 1000),
        resolvedAt: isResolved ? randomDate(reportedAt, new Date()) : null,
        aiConfidence: Math.random() * 0.4 + 0.6, // 60-100%
        aiSuggestedSeverity: randomElement(severities),
        aiFactors: randomElements(['température', 'pression', 'vibration', 'historique', 'maintenance'], 3),
        // Add AI prediction fields
        criticite: randomElement(['Critique', 'Moyenne', 'Basse']),
        disponibilite: Math.floor(Math.random() * 101), // 0-100
        fiabilite: Math.floor(Math.random() * 101), // 0-100
        processSafety: Math.floor(Math.random() * 101), // 0-100
        systeme: randomElement(['Turbine', 'Générateur', 'Transformateur', 'Pompe', 'Compresseur'])
      }
    });
    anomalies.push(anomaly);
  }

  // 8. Create Comments
  console.log('💬 Creating comments...');
  const comments: any[] = [];
  for (let i = 0; i < 300; i++) { // 300 comments
    const anomaly = randomElement(anomalies);
    const comment = await prisma.comment.create({
      data: {
        content: randomElement([
          'Intervention planifiée pour demain matin',
          'Pièce de rechange commandée',
          'Diagnostic terminé, cause identifiée',
          'Réparation en cours',
          'Test effectué, résultats conformes',
          'Anomalie résolue, équipement remis en service',
          'Suivi nécessaire dans 24h',
          'Escalade vers l\'équipe spécialisée'
        ]),
        anomalyId: anomaly.id,
        authorId: randomElement(users).id,
        createdAt: randomDate(anomaly.reportedAt, new Date())
      }
    });
    comments.push(comment);
  }

  // 9. Create Maintenance Tasks
  console.log('🔧 Creating maintenance tasks...');
  const maintenanceTasks: any[] = [];
  const maintenanceTypes = ['preventive', 'corrective', 'inspection', 'optimization'];
  const maintenanceStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'];
  const maintenancePriorities = ['critical', 'medium', 'low']; // Updated to match new system

  for (let i = 0; i < 80; i++) { // 80 maintenance tasks
    const startDate = randomDate(new Date('2024-01-01'), new Date('2024-12-31'));
    const duration = Math.floor(Math.random() * 16) + 2; // 2-18 hours
    const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
    
    const task = await prisma.maintenanceTask.create({
      data: {
        code: `MW-2024-${String(i + 1).padStart(3, '0')}`,
        title: `Maintenance ${randomElement(['Préventive', 'Corrective', 'Inspection', 'Optimisation'])} - ${randomElement(['Turbine', 'Générateur', 'Transformateur', 'Pompe'])}`,
        description: `Tâche de maintenance ${randomElement(['programmée', 'urgente', 'périodique'])} sur équipement critique.`,
        type: randomElement(maintenanceTypes),
        priority: randomElement(maintenancePriorities), // Updated to use new priorities
        status: randomElement(maintenanceStatuses),
        startDate,
        endDate,
        duration,
        plannedDowntime: Math.random() * 8, // 0-8 hours
        actualDowntime: Math.random() * 10, // 0-10 hours
        assignedTeamId: randomElement(teams).id,
        assignedToId: randomElement(users).id,
        siteId: randomElement(sites).id,
        equipmentIds: randomElements(equipment, Math.floor(Math.random() * 3) + 1).map(e => e.id),
        estimatedCost: Math.random() * 30000 + 5000, // 5k-35k MAD
        actualCost: Math.random() * 32000 + 4000, // 4k-36k MAD
        resourcesNeeded: randomElements(['Technicien', 'Pièces', 'Outils', 'Grue', 'Échafaudage'], 3),
        safetyRequirements: randomElements(['EPI', 'Consignation', 'Permis', 'Surveillance', 'Formation'], 2),
        weatherDependency: Math.random() < 0.3, // 30% weather dependent
        criticalPath: Math.random() < 0.2, // 20% critical path
        linkedAnomalyIds: Math.random() < 0.4 ? [randomElement(anomalies).id] : [],
        completionRate: Math.floor(Math.random() * 101) // 0-100%
      }
    });
    maintenanceTasks.push(task);
  }

  // 10. Create Maintenance Periods
  console.log('📅 Creating maintenance periods...');
  const maintenancePeriod: any[] = [];
  const periodTypes = ['maintenance', 'repair', 'inspection', 'emergency'];
  const periodStatuses = ['available', 'booked', 'pending'];
  
  // Sample periods that match the frontend expectations
  const samplePeriods = [
    {
      title: 'Maintenance Turbine A',
      startDate: new Date(2025, 0, 8), // 8/1/2025
      endDate: new Date(2025, 0, 14),  // 14/1/2025
      type: 'maintenance',
      status: 'booked',
      assignedTo: 'Équipe Alpha',
      location: 'Salle des machines'
    },
    {
      title: 'Arrêt Maintenance Générale',
      startDate: new Date(2025, 1, 1), // 1/2/2025
      endDate: new Date(2025, 1, 28),  // 28/2/2025
      type: 'maintenance',
      status: 'available',
      location: 'Toute l\'usine'
    },
    {
      title: 'Inspection Réglementaire',
      startDate: new Date(2025, 2, 15), // 15/3/2025
      endDate: new Date(2025, 2, 20),   // 20/3/2025
      type: 'inspection',
      status: 'pending',
      assignedTo: 'Bureau de contrôle',
      location: 'Zone industrielle'
    },
    {
      title: 'Réparation Compresseur',
      startDate: new Date(2025, 3, 10), // 10/4/2025
      endDate: new Date(2025, 3, 12),   // 12/4/2025
      type: 'repair',
      status: 'available',
      location: 'Atelier mécanique'
    },
    {
      title: 'Intervention Urgente',
      startDate: new Date(2025, 4, 20), // 20/5/2025
      endDate: new Date(2025, 4, 21),   // 21/5/2025
      type: 'emergency',
      status: 'booked',
      assignedTo: 'Équipe d\'urgence',
      location: 'Centrale technique'
    }
  ];

  // Create the sample periods
  for (const periodData of samplePeriods) {
    const diffTime = Math.abs(periodData.endDate.getTime() - periodData.startDate.getTime());
    const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const durationHours = durationDays * 24;

    const period = await prisma.maintenancePeriod.create({
      data: {
        title: periodData.title,
        description: `Période de ${periodData.type} programmée du ${periodData.startDate.toLocaleDateString('fr-FR')} au ${periodData.endDate.toLocaleDateString('fr-FR')}`,
        startDate: periodData.startDate,
        endDate: periodData.endDate,
        durationDays,
        durationHours,
        type: periodData.type,
        status: periodData.status,
        assignedTo: periodData.assignedTo || null,
        location: periodData.location || null
      }
    });
    maintenancePeriod.push(period);
  }

  // Create additional random periods
  for (let i = 0; i < 10; i++) {
    const startDate = randomDate(new Date('2025-01-01'), new Date('2025-12-31'));
    const durationDays = Math.floor(Math.random() * 14) + 1; // 1-14 days
    const endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);
    const durationHours = durationDays * 24;

    const period = await prisma.maintenancePeriod.create({
      data: {
        title: `${randomElement(['Maintenance', 'Réparation', 'Inspection', 'Optimisation'])} ${randomElement(['Turbine', 'Générateur', 'Compresseur', 'Pompe', 'Transformateur'])} ${String.fromCharCode(65 + i)}`,
        description: `Période de ${randomElement(periodTypes)} programmée`,
        startDate,
        endDate,
        durationDays,
        durationHours,
        type: randomElement(periodTypes),
        status: randomElement(periodStatuses),
        assignedTo: Math.random() < 0.6 ? randomElement(['Équipe Alpha', 'Équipe Beta', 'Équipe Gamma', 'Bureau de contrôle', 'Équipe d\'urgence']) : null,
        location: Math.random() < 0.8 ? randomElement(['Salle des machines', 'Zone industrielle', 'Atelier mécanique', 'Centrale technique', 'Toute l\'usine']) : null
      }
    });
    maintenancePeriod.push(period);
  }

  // 11. Create REX Entries
  console.log('📚 Creating REX entries...');
  const rexEntries: any[] = [];
  const rexCategories = ['Défaillance', 'Maintenance', 'Sécurité', 'Optimisation', 'Innovation'];
  const rexStatuses = ['draft', 'pending_review', 'approved', 'rejected'];
  const rexPriorities = ['critical', 'medium', 'low']; // Updated to match new system

  for (let i = 0; i < 40; i++) { // 40 REX entries
    const rex = await prisma.rEXEntry.create({
      data: {
        code: `REX-2024-${String(i + 1).padStart(3, '0')}`,
        title: `REX ${randomElement(['Défaillance', 'Maintenance', 'Amélioration'])} - ${randomElement(['Turbine', 'Générateur', 'Système de contrôle'])}`,
        anomalyId: Math.random() < 0.6 ? randomElement(anomalies).id : null,
        equipmentId: randomElement(equipment).id,
        equipmentType: randomElement(['mechanical', 'electrical', 'hydraulic', 'instrumentation']),
        category: randomElement(rexCategories),
        subcategory: randomElement(['Technique', 'Opérationnel', 'Organisationnel']),
        site: randomElement(sites).name,
        zone: randomElement(zones).name,
        status: randomElement(rexStatuses),
        priority: randomElement(rexPriorities), // Updated to use new priorities
        rootCause: randomElement([
          'Usure normale des composants',
          'Défaut de maintenance préventive',
          'Conditions environnementales défavorables',
          'Erreur de manipulation',
          'Défaillance du système de contrôle'
        ]),
        lessonsLearned: randomElement([
          'Importance de la maintenance préventive',
          'Nécessité d\'améliorer la formation',
          'Optimisation des procédures',
          'Renforcement des contrôles qualité',
          'Amélioration de la surveillance'
        ]),
        preventiveActions: randomElements([
          'Révision des procédures',
          'Formation complémentaire',
          'Amélioration des contrôles',
          'Mise à jour des instructions',
          'Renforcement de la surveillance'
        ], 3),
        solution: randomElement([
          'Remplacement du composant défaillant',
          'Ajustement des paramètres',
          'Modification de la procédure',
          'Formation des opérateurs',
          'Amélioration du système'
        ]),
        timeToResolve: randomElement(['2 heures', '1 jour', '3 jours', '1 semaine', '2 semaines']),
        costImpact: randomElement(['Faible', 'Moyen', 'Élevé']),
        downtimeHours: Math.random() * 48, // 0-48 hours
        safetyImpact: Math.random() < 0.3,
        environmentalImpact: Math.random() < 0.2,
        productionImpact: Math.random() < 0.5,
        tags: randomElements(['maintenance', 'sécurité', 'optimisation', 'défaillance', 'formation'], 3),
        knowledgeValue: randomElement(['high', 'medium', 'low']),
        reusabilityScore: Math.random() * 5, // 0-5
        rating: Math.random() * 2 + 3, // 3-5
        votes: Math.floor(Math.random() * 50), // 0-50
        views: Math.floor(Math.random() * 500), // 0-500
        bookmarks: Math.floor(Math.random() * 100), // 0-100
        relatedAnomalyIds: Math.random() < 0.3 ? [randomElement(anomalies).id] : [],
        createdById: randomElement(users).id,
        createdAt: randomDate(new Date('2024-01-01'), new Date()),
        approvedById: Math.random() < 0.7 ? randomElement(users).id : null,
        approvedAt: Math.random() < 0.7 ? randomDate(new Date('2024-01-01'), new Date()) : null
      }
    });
    rexEntries.push(rex);
  }

  // 12. Create KPI Metrics
  console.log('📊 Creating KPI metrics...');
  const kpiMetrics: any[] = [];
  const kpiCategories: ('anomalies' | 'performance' | 'operational')[] = ['anomalies', 'performance', 'operational'];
  const kpiNames: Record<'anomalies' | 'performance' | 'operational', string[]> = {
    anomalies: ['Total Anomalies', 'Critical Anomalies', 'Resolution Rate', 'Average Resolution Time', 'Overdue Anomalies'],
    performance: ['Equipment Availability', 'Energy Output', 'Efficiency Rate', 'Capacity Factor', 'Performance Ratio'],
    operational: ['Maintenance Hours', 'Downtime Hours', 'Cost per MWh', 'Team Productivity', 'Safety Incidents']
  };

  for (const category of kpiCategories) {
    for (const name of kpiNames[category]) {
      for (let month = 1; month <= 12; month++) {
        const currentValue = Math.random() * 100;
        const previousValue = currentValue + (Math.random() - 0.5) * 20;
        const change = ((currentValue - previousValue) / previousValue) * 100;
        
        const metric = await prisma.kPIMetric.create({
          data: {
            name,
            category,
            value: currentValue,
            previousValue,
            change,
            trend: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
            target: currentValue + Math.random() * 20,
            unit: name.includes('Time') ? 'hours' : name.includes('Rate') || name.includes('Ratio') ? '%' : name.includes('Cost') ? 'MAD' : 'count',
            status: Math.random() < 0.7 ? 'good' : Math.random() < 0.5 ? 'warning' : 'critical',
            period: 'monthly',
            calculatedAt: new Date(2024, month - 1, 1),
            siteId: Math.random() < 0.8 ? randomElement(sites).id : null
          }
        });
        kpiMetrics.push(metric);
      }
    }
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created:
  - ${departments.length} departments
  - ${sites.length} sites  
  - ${zones.length} zones
  - ${users.length} users
  - ${userProfiles.length} user profiles
  - ${teams.length} teams
  - ${teamMembers.length} team members
  - ${equipment.length} equipment
  - ${anomalies.length} anomalies (3-level severity: critical/medium/low)
  - ${comments.length} comments
  - ${maintenanceTasks.length} maintenance tasks
  - ${maintenancePeriod.length} maintenance periods
  - ${rexEntries.length} REX entries
  - ${kpiMetrics.length} KPI metrics`);
  
  console.log(`🎯 New 3-level severity system implemented:
  - Critical (P1): ${anomalies.filter(a => a.severity === 'critical').length} anomalies
  - Medium (P2): ${anomalies.filter(a => a.severity === 'medium').length} anomalies  
  - Low (P3): ${anomalies.filter(a => a.severity === 'low').length} anomalies`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
