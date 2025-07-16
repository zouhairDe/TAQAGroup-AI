import { 
  MaintenanceTemplate, 
  MaintenanceWorkflow, 
  MaintenanceAction,
  MaintenanceTemplateAction,
  MaintenanceTemplateCheckpoint
} from '@/types/maintenance-actions';

// Mock maintenance templates
export const mockMaintenanceTemplates: MaintenanceTemplate[] = [
  {
    id: 'tpl-001',
    name: 'Maintenance Ventilateur Standard',
    description: 'Procédure standard pour la maintenance des ventilateurs industriels',
    category: 'mechanical',
    equipmentType: ['ventilateur', 'turbine'],
    estimatedTotalDuration: 240, // 4 hours
    isActive: true,
    createdById: 'user-001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    actions: [
      {
        id: 'tpl-act-001',
        title: 'Diagnostic initial',
        description: 'Inspection visuelle et analyse des vibrations',
        type: 'diagnosis',
        priority: 'high',
        estimatedDuration: 45,
        resourcesNeeded: ['Vibromètre', 'Lampe torche', 'Checklist'],
        skillsRequired: ['Mécanique niveau 2', 'Mesures vibratoires'],
        safetyRequirements: ['EPI complet', 'Consignation équipement'],
        order: 1,
        dependencies: [],
        requiresApproval: false,
        checkpoints: [
          {
            id: 'chk-001',
            title: 'Vérifier l\'état des roulements',
            description: 'Contrôle auditif et tactile',
            isMandatory: true,
            order: 1
          },
          {
            id: 'chk-002',
            title: 'Mesurer les vibrations',
            description: 'Relevé des niveaux sur 3 axes',
            isMandatory: true,
            order: 2
          }
        ]
      },
      {
        id: 'tpl-act-002',
        title: 'Démontage sécurisé',
        description: 'Démontage du ventilateur selon procédure',
        type: 'preparation',
        priority: 'high',
        estimatedDuration: 60,
        resourcesNeeded: ['Clés dynamométriques', 'Pont roulant', 'Sangles'],
        skillsRequired: ['Mécanique niveau 3', 'Habilitation pont roulant'],
        safetyRequirements: ['EPI complet', 'Équipier secours', 'Plan de levage'],
        order: 2,
        dependencies: ['tpl-act-001'],
        requiresApproval: true,
        checkpoints: [
          {
            id: 'chk-003',
            title: 'Consignation électrique validée',
            description: 'VAT effectué',
            isMandatory: true,
            order: 1
          },
          {
            id: 'chk-004',
            title: 'Marquage position rotor',
            description: 'Repérage pour remontage',
            isMandatory: true,
            order: 2
          }
        ]
      },
      {
        id: 'tpl-act-003',
        title: 'Remplacement roulements',
        description: 'Changement des roulements défaillants',
        type: 'execution',
        priority: 'critical',
        estimatedDuration: 90,
        resourcesNeeded: ['Roulements neufs', 'Extracteur', 'Presse hydraulique', 'Graisse'],
        skillsRequired: ['Mécanique niveau 3', 'Roulements industriels'],
        safetyRequirements: ['EPI complet', 'Protection oculaire renforcée'],
        order: 3,
        dependencies: ['tpl-act-002'],
        requiresApproval: false,
        checkpoints: [
          {
            id: 'chk-005',
            title: 'Vérification référence roulements',
            description: 'Contrôle conformité pièces',
            isMandatory: true,
            order: 1
          },
          {
            id: 'chk-006',
            title: 'Nettoyage logements',
            description: 'Dégraissage et inspection',
            isMandatory: true,
            order: 2
          }
        ]
      },
      {
        id: 'tpl-act-004',
        title: 'Remontage et alignement',
        description: 'Remontage avec contrôle d\'alignement',
        type: 'execution',
        priority: 'high',
        estimatedDuration: 45,
        resourcesNeeded: ['Comparateur', 'Cales', 'Clés dynamométriques'],
        skillsRequired: ['Mécanique niveau 3', 'Alignement laser'],
        safetyRequirements: ['EPI complet'],
        order: 4,
        dependencies: ['tpl-act-003'],
        requiresApproval: false,
        checkpoints: []
      }
    ]
  },
  {
    id: 'tpl-002',
    name: 'Maintenance Électrique Préventive',
    description: 'Contrôle électrique standard pour équipements industriels',
    category: 'electrical',
    equipmentType: ['moteur', 'transformateur', 'armoire'],
    estimatedTotalDuration: 180, // 3 hours
    isActive: true,
    createdById: 'user-002',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    actions: [
      {
        id: 'tpl-act-101',
        title: 'Contrôle isolation',
        description: 'Mesure résistance d\'isolement',
        type: 'diagnosis',
        priority: 'high',
        estimatedDuration: 30,
        resourcesNeeded: ['Mégohmmètre', 'Multimètre'],
        skillsRequired: ['Électricien niveau 2', 'Habilitation BR'],
        safetyRequirements: ['EPI électrique', 'VAT'],
        order: 1,
        dependencies: [],
        requiresApproval: false,
        checkpoints: []
      },
      {
        id: 'tpl-act-102',
        title: 'Nettoyage contacts',
        description: 'Nettoyage et graissage des contacts',
        type: 'execution',
        priority: 'medium',
        estimatedDuration: 45,
        resourcesNeeded: ['Dégraissant', 'Graisse contacts', 'Pinceaux'],
        skillsRequired: ['Électricien niveau 2'],
        safetyRequirements: ['EPI électrique'],
        order: 2,
        dependencies: ['tpl-act-101'],
        requiresApproval: false,
        checkpoints: []
      }
    ]
  }
];

// Mock workflow for demo
export const mockMaintenanceWorkflow: MaintenanceWorkflow = {
  id: 'wf-001',
  anomalyId: 'ABO-2024-158',
  title: 'Réparation Ventilateur V12',
  status: 'in_progress',
  progressPercentage: 65,
  estimatedTotalDuration: 240,
  actualTotalDuration: 156,
  plannedStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
  actualStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
  estimatedCost: 2500,
  createdById: 'user-001',
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  templateId: 'tpl-001',
  actions: [
    {
      id: 'act-001',
      anomalyId: 'ABO-2024-158',
      title: 'Diagnostic initial',
      description: 'Inspection visuelle et analyse des vibrations du ventilateur V12',
      type: 'diagnosis',
      status: 'completed',
      priority: 'high',
      estimatedDuration: 45,
      actualDuration: 38,
      resourcesNeeded: ['Vibromètre', 'Lampe torche', 'Checklist'],
      skillsRequired: ['Mécanique niveau 2', 'Mesures vibratoires'],
      safetyRequirements: ['EPI complet', 'Consignation équipement'],
      assignedToId: 'user-bennani',
      plannedStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actualStartDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      actualEndDate: new Date(Date.now() - 82 * 60 * 1000),
      dependencies: [],
      isBlocking: false,
      dependents: ['act-002'],
      progressPercentage: 100,
      checkpoints: [
        {
          id: 'chk-001',
          title: 'Vérifier l\'état des roulements',
          description: 'Contrôle auditif et tactile',
          isCompleted: true,
          completedAt: new Date(Date.now() - 90 * 60 * 1000),
          completedById: 'user-bennani',
          notes: 'Bruit anormal détecté côté moteur',
          isMandatory: true,
          order: 1
        },
        {
          id: 'chk-002',
          title: 'Mesurer les vibrations',
          description: 'Relevé des niveaux sur 3 axes',
          isCompleted: true,
          completedAt: new Date(Date.now() - 85 * 60 * 1000),
          completedById: 'user-bennani',
          notes: 'Vibrations excessive axe horizontal: 8.5mm/s',
          isMandatory: true,
          order: 2
        }
      ],
      attachments: [],
      notes: 'Diagnostic confirmé: roulement côté moteur défaillant. Remplacement nécessaire.',
      requiresApproval: false,
      createdById: 'user-001',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 82 * 60 * 1000)
    },
    {
      id: 'act-002',
      anomalyId: 'ABO-2024-158',
      title: 'Commande pièces de rechange',
      description: 'Commander le roulement de remplacement référence SKF 6312',
      type: 'preparation',
      status: 'in_progress',
      priority: 'high',
      estimatedDuration: 30,
      actualDuration: 25,
      resourcesNeeded: ['Bon de commande', 'Catalogue fournisseur'],
      skillsRequired: ['Gestion stock'],
      safetyRequirements: [],
      assignedToId: 'user-stock',
      plannedStartDate: new Date(Date.now() - 80 * 60 * 1000),
      actualStartDate: new Date(Date.now() - 80 * 60 * 1000),
      dependencies: ['act-001'],
      isBlocking: true,
      dependents: ['act-003'],
      progressPercentage: 85,
      checkpoints: [
        {
          id: 'chk-003',
          title: 'Vérifier disponibilité stock',
          description: 'Contrôle stock magasin',
          isCompleted: true,
          completedAt: new Date(Date.now() - 75 * 60 * 1000),
          completedById: 'user-stock',
          notes: 'Stock épuisé - commande externe nécessaire',
          isMandatory: true,
          order: 1
        },
        {
          id: 'chk-004',
          title: 'Passer commande fournisseur',
          description: 'Commande chez SKF',
          isCompleted: true,
          completedAt: new Date(Date.now() - 45 * 60 * 1000),
          completedById: 'user-stock',
          notes: 'Commande N°CMD-2024-1532 - Livraison prévue demain 9h',
          isMandatory: true,
          order: 2
        }
      ],
      attachments: [],
      notes: 'Pièce commandée chez SKF. Livraison prévue demain matin 9h00.',
      requiresApproval: false,
      createdById: 'user-001',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 'act-003',
      anomalyId: 'ABO-2024-158',
      title: 'Démontage ventilateur',
      description: 'Démontage sécurisé du ventilateur pour accès aux roulements',
      type: 'execution',
      status: 'pending',
      priority: 'high',
      estimatedDuration: 60,
      resourcesNeeded: ['Clés dynamométriques', 'Pont roulant', 'Sangles'],
      skillsRequired: ['Mécanique niveau 3', 'Habilitation pont roulant'],
      safetyRequirements: ['EPI complet', 'Équipier secours', 'Plan de levage'],
      dependencies: ['act-002'],
      isBlocking: true,
      dependents: ['act-004'],
      progressPercentage: 0,
      checkpoints: [
        {
          id: 'chk-005',
          title: 'Consignation électrique validée',
          description: 'VAT effectué par électricien',
          isCompleted: false,
          isMandatory: true,
          order: 1
        },
        {
          id: 'chk-006',
          title: 'Marquage position rotor',
          description: 'Repérage pour remontage',
          isCompleted: false,
          isMandatory: true,
          order: 2
        }
      ],
      attachments: [],
      requiresApproval: true,
      createdById: 'user-001',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000)
    },
    {
      id: 'act-004',
      anomalyId: 'ABO-2024-158',
      title: 'Remplacement roulement',
      description: 'Extraction ancien roulement et montage du neuf',
      type: 'execution',
      status: 'pending',
      priority: 'critical',
      estimatedDuration: 90,
      resourcesNeeded: ['Roulement SKF 6312', 'Extracteur', 'Presse hydraulique', 'Graisse'],
      skillsRequired: ['Mécanique niveau 3', 'Roulements industriels'],
      safetyRequirements: ['EPI complet', 'Protection oculaire renforcée'],
      dependencies: ['act-003'],
      isBlocking: true,
      dependents: ['act-005'],
      progressPercentage: 0,
      checkpoints: [],
      attachments: [],
      requiresApproval: false,
      createdById: 'user-001',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000)
    },
    {
      id: 'act-005',
      anomalyId: 'ABO-2024-158',
      title: 'Tests et mise en service',
      description: 'Remontage, tests de fonctionnement et validation',
      type: 'verification',
      status: 'pending',
      priority: 'high',
      estimatedDuration: 45,
      resourcesNeeded: ['Comparateur', 'Vibromètre', 'Multimètre'],
      skillsRequired: ['Mécanique niveau 3', 'Tests vibratoires'],
      safetyRequirements: ['EPI complet'],
      dependencies: ['act-004'],
      isBlocking: false,
      dependents: [],
      progressPercentage: 0,
      checkpoints: [],
      attachments: [],
      requiresApproval: true,
      createdById: 'user-001',
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
      updatedAt: new Date(Date.now() - 90 * 60 * 1000)
    }
  ]
}; 

// Function to create workflow from template
export const createMockWorkflowFromTemplate = (
  anomalyId: string,
  template: MaintenanceTemplate
): MaintenanceWorkflow => {
  const workflowId = `workflow_${Date.now()}`;
  
  const actions: MaintenanceAction[] = template.actions.map((templateAction, index) => ({
    id: `action_${Date.now()}_${index}`,
    workflowId: workflowId,
    title: templateAction.title,
    description: templateAction.description,
    type: templateAction.type,
    status: 'pending' as const,
    priority: templateAction.priority,
    order: templateAction.order,
    estimatedDuration: templateAction.estimatedDuration,
    actualDuration: null,
    assignedTo: null,
    startedAt: null,
    completedAt: null,
    dependencies: templateAction.dependencies,
    resourcesNeeded: templateAction.resourcesNeeded,
    resourcesUsed: [],
    skillsRequired: templateAction.skillsRequired,
    safetyRequirements: templateAction.safetyRequirements,
    requiresApproval: templateAction.requiresApproval,
    notes: [],
    checkpoints: templateAction.checkpoints.map(checkpoint => ({
      id: `checkpoint_${Date.now()}_${checkpoint.id}`,
      title: checkpoint.title,
      description: checkpoint.description,
      isMandatory: checkpoint.isMandatory,
      completed: false,
      completedAt: null,
      order: checkpoint.order
    })),
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  return {
    id: workflowId,
    anomalyId,
    title: `${template.name} - ${anomalyId}`,
    description: `Workflow créé à partir du template: ${template.description}`,
    status: 'pending',
    priority: 'medium',
    actions,
    templateId: template.id,
    assignedTo: null,
    estimatedDuration: template.estimatedTotalDuration,
    actualDuration: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}; 