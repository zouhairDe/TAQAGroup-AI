import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../core/database/client';

// Types for request parameters
interface LogFilters {
  jobName?: string;
  status?: string;
  sourceLayer?: string;
  targetLayer?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface LogByIdParams {
  id: string;
}

interface JobStatsParams {
  jobName?: string;
  days?: number;
}

/**
 * Get all data processing logs with filtering, pagination, and sorting
 */
export async function getDataProcessingLogs(
  request: FastifyRequest<{ Querystring: LogFilters }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const {
      jobName,
      status,
      sourceLayer,
      targetLayer,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'startTime',
      sortOrder = 'desc'
    } = request.query;

    // Build where clause
    const whereClause: any = {};

    if (jobName) {
      whereClause.jobName = {
        contains: jobName,
        mode: 'insensitive'
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (sourceLayer) {
      whereClause.sourceLayer = sourceLayer;
    }

    if (targetLayer) {
      whereClause.targetLayer = targetLayer;
    }

    // Date range filtering
    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel
    const [logs, totalCount] = await Promise.all([
      prisma.dataProcessingLog.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit
      }),
      prisma.dataProcessingLog.count({ where: whereClause })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    reply.send({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        jobName,
        status,
        sourceLayer,
        targetLayer,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Error fetching data processing logs:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch data processing logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get data processing log by ID
 */
export async function getDataProcessingLogById(
  request: FastifyRequest<{ Params: LogByIdParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    const log = await prisma.dataProcessingLog.findUnique({
      where: { id }
    });

    if (!log) {
      return reply.status(404).send({
        success: false,
        message: 'Data processing log not found'
      });
    }

    reply.send({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching data processing log:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch data processing log',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get data processing statistics
 */
export async function getDataProcessingStats(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // Get overall statistics
    const [
      totalJobs,
      successfulJobs,
      failedJobs,
      runningJobs,
      totalRecordsProcessed,
      recentJobs
    ] = await Promise.all([
      prisma.dataProcessingLog.count(),
      prisma.dataProcessingLog.count({ where: { status: 'completed' } }),
      prisma.dataProcessingLog.count({ where: { status: 'failed' } }),
      prisma.dataProcessingLog.count({ where: { status: 'running' } }),
      prisma.dataProcessingLog.aggregate({
        _sum: { recordsProcessed: true }
      }),
      prisma.dataProcessingLog.findMany({
        orderBy: { startTime: 'desc' },
        take: 5,
        select: {
          id: true,
          jobName: true,
          status: true,
          startTime: true,
          endTime: true,
          recordsProcessed: true,
          recordsSucceeded: true,
          recordsFailed: true
        }
      })
    ]);

    // Calculate success rate
    const successRate = totalJobs > 0 ? ((successfulJobs / totalJobs) * 100).toFixed(1) : '0.0';

    // Get job distribution by status
    const statusDistribution = await prisma.dataProcessingLog.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Get job distribution by job name
    const jobNameDistribution = await prisma.dataProcessingLog.groupBy({
      by: ['jobName'],
      _count: { jobName: true },
      orderBy: { _count: { jobName: 'desc' } },
      take: 10
    });

    reply.send({
      success: true,
      data: {
        overview: {
          totalJobs,
          successfulJobs,
          failedJobs,
          runningJobs,
          successRate: parseFloat(successRate),
          totalRecordsProcessed: totalRecordsProcessed._sum.recordsProcessed || 0
        },
        statusDistribution: statusDistribution.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
        jobNameDistribution: jobNameDistribution.map(item => ({
          jobName: item.jobName,
          count: item._count.jobName
        })),
        recentJobs
      }
    });
  } catch (error) {
    console.error('Error fetching data processing statistics:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch data processing statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get job performance metrics for a specific job
 */
export async function getJobPerformanceMetrics(
  request: FastifyRequest<{ Params: { jobName: string }; Querystring: JobStatsParams }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { jobName } = request.params;
    const { days = 30 } = request.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get job performance data
    const jobLogs = await prisma.dataProcessingLog.findMany({
      where: {
        jobName,
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startTime: 'desc' }
    });

    if (jobLogs.length === 0) {
      return reply.status(404).send({
        success: false,
        message: `No logs found for job '${jobName}' in the last ${days} days`
      });
    }

    // Calculate metrics
    const totalRuns = jobLogs.length;
    const successfulRuns = jobLogs.filter(log => log.status === 'completed').length;
    const failedRuns = jobLogs.filter(log => log.status === 'failed').length;
    const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : '0.0';

    // Calculate average processing time for completed jobs
    const completedJobs = jobLogs.filter(log => log.status === 'completed' && log.endTime);
    const avgProcessingTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, log) => {
          const duration = log.endTime!.getTime() - log.startTime.getTime();
          return sum + duration;
        }, 0) / completedJobs.length / 1000 // Convert to seconds
      : 0;

    // Calculate total records processed
    const totalRecordsProcessed = jobLogs.reduce((sum, log) => sum + log.recordsProcessed, 0);
    const totalRecordsSucceeded = jobLogs.reduce((sum, log) => sum + log.recordsSucceeded, 0);
    const totalRecordsFailed = jobLogs.reduce((sum, log) => sum + log.recordsFailed, 0);

    // Get recent runs
    const recentRuns = jobLogs.slice(0, 10).map(log => ({
      id: log.id,
      status: log.status,
      startTime: log.startTime,
      endTime: log.endTime,
      recordsProcessed: log.recordsProcessed,
      recordsSucceeded: log.recordsSucceeded,
      recordsFailed: log.recordsFailed,
      duration: log.endTime ? log.endTime.getTime() - log.startTime.getTime() : null
    }));

    reply.send({
      success: true,
      data: {
        jobName,
        period: `Last ${days} days`,
        metrics: {
          totalRuns,
          successfulRuns,
          failedRuns,
          successRate: parseFloat(successRate),
          avgProcessingTimeSeconds: Math.round(avgProcessingTime),
          totalRecordsProcessed,
          totalRecordsSucceeded,
          totalRecordsFailed,
          dataQualityRate: totalRecordsProcessed > 0 
            ? parseFloat(((totalRecordsSucceeded / totalRecordsProcessed) * 100).toFixed(1))
            : 0
        },
        recentRuns
      }
    });
  } catch (error) {
    console.error('Error fetching job performance metrics:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch job performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get unique job names for filtering
 */
export async function getJobNames(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const jobNames = await prisma.dataProcessingLog.findMany({
      select: { jobName: true },
      distinct: ['jobName'],
      orderBy: { jobName: 'asc' }
    });

    reply.send({
      success: true,
      data: jobNames.map(item => item.jobName)
    });
  } catch (error) {
    console.error('Error fetching job names:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch job names',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get logs for a specific time period (today, yesterday, last week, etc.)
 */
export async function getLogsByTimePeriod(
  request: FastifyRequest<{ Params: { period: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { period } = request.params;
    
    let startDate: Date;
    let endDate: Date = new Date();
    
    switch (period.toLowerCase()) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        return reply.status(400).send({
          success: false,
          message: 'Invalid period. Use: today, yesterday, week, or month'
        });
    }

    const logs = await prisma.dataProcessingLog.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { startTime: 'desc' }
    });

    reply.send({
      success: true,
      data: logs,
      period,
      dateRange: {
        startDate,
        endDate
      },
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching logs by time period:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch logs by time period',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 