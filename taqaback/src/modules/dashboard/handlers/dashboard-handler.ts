import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('DashboardHandler');
const prisma = getDatabaseClient();

interface DashboardMetrics {
  totalAnomalies: number;
  anomaliesChange: number;
  totalInterventions: number;
  interventionsChange: number;
  resolutionRate: number;
  resolutionRateChange: number;
  averageResolutionTime: number;
  resolutionTimeChange: number;
}

interface AnomalyTypeDistribution {
  type: string;
  count: number;
  percentage: number;
  color: string;
  trend: string;
  severity: string;
}

interface CriticalAlert {
  id: string;
  title: string;
  time: string;
  severity: string;
  location: string;
  equipment: string;
  temperature?: string;
  pressure?: string;
  status: string;
  actionRequired: boolean;
}

interface TeamPerformanceData {
  name: string;
  leader: string;
  resolved: number;
  pending: number;
  efficiency: number;
  responseTime: string;
  satisfaction: number;
  trend: string;
  members: number;
  shift: string;
  status: string;
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  user: string;
  userRole: string;
  time: string;
  type: string;
  category: string;
  equipment: string;
  location: string;
  priority: string;
  duration?: string;
}

export class DashboardHandler {
  
  /**
   * Get dashboard overview metrics
   */
  async getDashboardOverview(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [
        totalAnomalies,
        resolvedAnomalies,
        totalMaintenanceTasks,
        averageResolutionTime
      ] = await Promise.all([
        prisma.anomaly.count(),
        prisma.anomaly.count({ where: { status: 'resolved' } }),
        prisma.maintenanceTask.count(),
        this.calculateAverageResolutionTime()
      ]);

      const resolutionRate = totalAnomalies > 0 ? (resolvedAnomalies / totalAnomalies) * 100 : 0;

      const metrics: DashboardMetrics = {
        totalAnomalies,
        anomaliesChange: 20, // Mock change for now
        totalInterventions: totalMaintenanceTasks,
        interventionsChange: 4, // Mock change for now
        resolutionRate: Math.round(resolutionRate),
        resolutionRateChange: -1.59, // Mock change for now
        averageResolutionTime: averageResolutionTime || 2.93, // in hours
        resolutionTimeChange: 7 // Mock change for now
      };

      return {
        success: true,
        data: metrics
      };
    } catch (error) {
      logger.error('Error getting dashboard overview:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve dashboard overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get anomaly type distribution
   */
  async getAnomalyTypeDistribution(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const anomalyTypes = await prisma.anomaly.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } }
      });

      const total = anomalyTypes.reduce((sum: number, type: any) => sum + type._count.category, 0);
      
      const colorMap: Record<string, string> = {
        'mechanical': '#00a0df',
        'electrical': '#f04438',
        'hydraulic': '#f79009',
        'instrumentation': '#12b76a',
        'control': '#875bf7'
      };

      const distribution: AnomalyTypeDistribution[] = anomalyTypes.map((type: any) => ({
        type: type.category,
        count: type._count.category,
        percentage: Math.round((type._count.category / total) * 100),
        color: colorMap[type.category] || '#6b7280',
        trend: '+5.2%', // Mock trend
        severity: 'medium' // Mock severity
      }));

      return {
        success: true,
        data: distribution
      };
    } catch (error) {
      logger.error('Error getting anomaly type distribution:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve anomaly type distribution',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get critical alerts
   */
  async getCriticalAlerts(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const criticalAnomalies = await prisma.anomaly.findMany({
        where: {
          severity: { in: ['critical'] },
          status: { in: ['new', 'assigned', 'in_progress'] }
        },
        include: {
          equipment: true,
          assignedTo: true
        },
        orderBy: { reportedAt: 'desc' },
        take: 10
      });

      const alerts: CriticalAlert[] = criticalAnomalies.map((anomaly: any) => ({
        id: anomaly.id,
        title: anomaly.title,
        time: this.formatTimeAgo(anomaly.reportedAt),
        severity: anomaly.severity,
        location: anomaly.equipment?.code || 'Unknown',
        equipment: anomaly.equipment?.name || 'Unknown Equipment',
        status: anomaly.status,
        actionRequired: anomaly.severity === 'critical'
      }));

      return {
        success: true,
        data: alerts
      };
    } catch (error) {
      logger.error('Error getting critical alerts:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve critical alerts',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get team performance data
   */
  async getTeamPerformance(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const teams = await prisma.team.findMany({
        where: { isActive: true },
        include: {
          leader: true,
          members: true,
          assignments: {
            where: {
              reportedAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
              }
            }
          }
        },
        take: 10
      });

      const teamPerformance: TeamPerformanceData[] = teams.map((team: any) => {
        const resolvedCount = team.assignments.filter((a: any) => a.status === 'resolved').length;
        const pendingCount = team.assignments.filter((a: any) => a.status !== 'resolved').length;
        const efficiency = team.assignments.length > 0 ? (resolvedCount / team.assignments.length) * 100 : 0;

        return {
          name: team.name,
          leader: team.leader?.name || 'Non assigné',
          resolved: resolvedCount,
          pending: pendingCount,
          efficiency: Math.round(efficiency),
          responseTime: '2.5h', // Mock response time
          satisfaction: 4.8, // Mock satisfaction
          trend: '+5%', // Mock trend
          members: team.members.length,
          shift: 'Matin', // Mock shift
          status: 'active'
        };
      });

      return {
        success: true,
        data: teamPerformance
      };
    } catch (error) {
      logger.error('Error getting team performance:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve team performance',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [recentAnomalies, recentMaintenance] = await Promise.all([
        prisma.anomaly.findMany({
          include: {
            reportedBy: true,
            equipment: true
          },
          orderBy: { reportedAt: 'desc' },
          take: 10
        }),
        prisma.maintenanceTask.findMany({
          include: {
            assignedTeam: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      const activities: RecentActivity[] = [];

      // Add anomaly activities
      recentAnomalies.forEach((anomaly: any) => {
        activities.push({
          id: anomaly.id,
          action: anomaly.status === 'resolved' ? 'Anomalie résolue' : 'Nouvelle anomalie détectée',
          description: anomaly.description,
          user: anomaly.reportedBy?.name || 'Système',
          userRole: anomaly.reportedBy?.role || 'Automatique',
          time: this.formatTimeAgo(anomaly.reportedAt),
          type: anomaly.status === 'resolved' ? 'success' : 'alert',
          category: anomaly.status === 'resolved' ? 'resolution' : 'detection',
          equipment: anomaly.equipment?.name || 'Unknown',
          location: anomaly.equipment?.code || 'Unknown',
          priority: anomaly.severity
        });
      });

      // Add maintenance activities
      recentMaintenance.forEach((task: any) => {
        activities.push({
          id: task.id,
          action: task.status === 'completed' ? 'Maintenance terminée' : 'Maintenance planifiée',
          description: task.description,
          user: task.assignedTeam?.name || 'Non assigné',
          userRole: 'Équipe',
          time: this.formatTimeAgo(task.createdAt),
          type: task.status === 'completed' ? 'success' : 'info',
          category: task.status === 'completed' ? 'completion' : 'planning',
          equipment: task.title,
          location: 'Zone A', // Mock location
          priority: task.priority,
          duration: `${task.duration}h`
        });
      });

      // Sort by time and take the most recent
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      return {
        success: true,
        data: activities.slice(0, 15)
      };
    } catch (error) {
      logger.error('Error getting recent activities:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve recent activities',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get complete dashboard data
   */
  async getDashboardData(
    request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [
        overview,
        anomalyDistribution,
        criticalAlerts,
        teamPerformance,
        recentActivities
      ] = await Promise.all([
        this.getDashboardOverview(request, reply),
        this.getAnomalyTypeDistribution(request, reply),
        this.getCriticalAlerts(request, reply),
        this.getTeamPerformance(request, reply),
        this.getRecentActivities(request, reply)
      ]);

      return {
        success: true,
        data: {
          metrics: overview.success ? overview.data : {},
          anomalyDistribution: anomalyDistribution.success ? anomalyDistribution.data : [],
          criticalAlerts: criticalAlerts.success ? criticalAlerts.data : [],
          teamPerformance: teamPerformance.success ? teamPerformance.data : [],
          recentActivities: recentActivities.success ? recentActivities.data : []
        }
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve dashboard data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate average resolution time in hours
   */
  private async calculateAverageResolutionTime(): Promise<number> {
    try {
      const resolvedAnomalies = await prisma.anomaly.findMany({
        where: {
          status: 'resolved',
          resolvedAt: { not: null }
        },
        select: {
          reportedAt: true,
          resolvedAt: true
        }
      });

      if (resolvedAnomalies.length === 0) return 0;

      const totalTime = resolvedAnomalies.reduce((sum, anomaly) => {
        if (anomaly.resolvedAt) {
          const timeDiff = anomaly.resolvedAt.getTime() - anomaly.reportedAt.getTime();
          return sum + (timeDiff / (1000 * 60 * 60)); // Convert to hours
        }
        return sum;
      }, 0);

      return totalTime / resolvedAnomalies.length;
    } catch (error) {
      logger.error('Error calculating average resolution time:', error);
      return 0;
    }
  }

  /**
   * Format time ago
   */
  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  }
} 