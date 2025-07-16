import { FastifyInstance } from 'fastify';
import { DashboardHandler } from '../handlers/dashboard-handler';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('DashboardRoutes');

export async function registerDashboardRoutes(fastify: FastifyInstance) {
  const dashboardHandler = new DashboardHandler();

  // Dashboard overview metrics
  fastify.get('/overview', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get dashboard overview metrics',
      description: 'Retrieve key metrics for the dashboard including anomalies, interventions, and resolution rates',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalAnomalies: { type: 'number' },
                anomaliesChange: { type: 'number' },
                totalInterventions: { type: 'number' },
                interventionsChange: { type: 'number' },
                resolutionRate: { type: 'number' },
                resolutionRateChange: { type: 'number' },
                averageResolutionTime: { type: 'number' },
                resolutionTimeChange: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getDashboardOverview.bind(dashboardHandler));

  // Anomaly type distribution
  fastify.get('/anomaly-distribution', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get anomaly type distribution',
      description: 'Retrieve the distribution of anomalies by category/type',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  count: { type: 'number' },
                  percentage: { type: 'number' },
                  color: { type: 'string' },
                  trend: { type: 'string' },
                  severity: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getAnomalyTypeDistribution.bind(dashboardHandler));

  // Critical alerts
  fastify.get('/critical-alerts', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get critical alerts',
      description: 'Retrieve current critical and high priority alerts',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  time: { type: 'string' },
                  severity: { type: 'string' },
                  location: { type: 'string' },
                  equipment: { type: 'string' },
                  status: { type: 'string' },
                  actionRequired: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getCriticalAlerts.bind(dashboardHandler));

  // Team performance
  fastify.get('/team-performance', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get team performance metrics',
      description: 'Retrieve performance metrics for all active teams',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  leader: { type: 'string' },
                  resolved: { type: 'number' },
                  pending: { type: 'number' },
                  efficiency: { type: 'number' },
                  responseTime: { type: 'string' },
                  satisfaction: { type: 'number' },
                  trend: { type: 'string' },
                  members: { type: 'number' },
                  shift: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getTeamPerformance.bind(dashboardHandler));

  // Recent activities
  fastify.get('/recent-activities', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get recent activities',
      description: 'Retrieve recent anomaly and maintenance activities',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  action: { type: 'string' },
                  description: { type: 'string' },
                  user: { type: 'string' },
                  userRole: { type: 'string' },
                  time: { type: 'string' },
                  type: { type: 'string' },
                  category: { type: 'string' },
                  equipment: { type: 'string' },
                  location: { type: 'string' },
                  priority: { type: 'string' },
                  duration: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getRecentActivities.bind(dashboardHandler));

  // Complete dashboard data (single endpoint for all data)
  fastify.get('/data', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get complete dashboard data',
      description: 'Retrieve all dashboard data in a single request',
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                metrics: { type: 'object' },
                anomalyDistribution: { type: 'object' },
                criticalAlerts: { type: 'object' },
                teamPerformance: { type: 'object' },
                recentActivities: { type: 'object' }
              }
            }
          }
        }
      }
    }
  }, dashboardHandler.getDashboardData.bind(dashboardHandler));

  logger.info('Dashboard routes registered successfully');
} 