import { FastifyInstance } from 'fastify';
import {
  getDataProcessingLogs,
  getDataProcessingLogById,
  getDataProcessingStats,
  getJobPerformanceMetrics,
  getJobNames,
  getLogsByTimePeriod
} from '../handlers/data-processing-log-handler';

// Schema definitions for request validation and API documentation
const LogFiltersSchema = {
  type: 'object',
  properties: {
    jobName: { type: 'string' },
    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
    sourceLayer: { type: 'string' },
    targetLayer: { type: 'string' },
    startDate: { type: 'string', format: 'date-time' },
    endDate: { type: 'string', format: 'date-time' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    sortBy: { type: 'string', enum: ['startTime', 'endTime', 'jobName', 'status', 'recordsProcessed'], default: 'startTime' },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
  }
};

const LogByIdSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string' }
  }
};

const JobPerformanceSchema = {
  type: 'object',
  required: ['jobName'],
  properties: {
    jobName: { type: 'string' }
  }
};

const JobStatsQuerySchema = {
  type: 'object',
  properties: {
    days: { type: 'integer', minimum: 1, maximum: 365, default: 30 }
  }
};

const TimePeriodSchema = {
  type: 'object',
  required: ['period'],
  properties: {
    period: { type: 'string', enum: ['today', 'yesterday', 'week', 'month'] }
  }
};

export default async function dataProcessingLogRoutes(fastify: FastifyInstance) {
  // Get all data processing logs with filtering, pagination, and sorting
  fastify.get('/logs', {
    schema: {
      description: 'Get all data processing logs with filtering, pagination, and sorting',
      tags: ['Data Processing Logs'],
      querystring: LogFiltersSchema,
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
                  jobName: { type: 'string' },
                  sourceLayer: { type: 'string' },
                  targetLayer: { type: 'string' },
                  recordsProcessed: { type: 'integer' },
                  recordsSucceeded: { type: 'integer' },
                  recordsFailed: { type: 'integer' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  status: { type: 'string' },
                  errorMessage: { type: 'string' },
                  metadata: { type: 'object' }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                currentPage: { type: 'integer' },
                totalPages: { type: 'integer' },
                totalCount: { type: 'integer' },
                limit: { type: 'integer' },
                hasNextPage: { type: 'boolean' },
                hasPrevPage: { type: 'boolean' }
              }
            },
            filters: { type: 'object' }
          }
        }
      }
    }
  }, getDataProcessingLogs);

  // Get data processing log by ID
  fastify.get('/logs/:id', {
    schema: {
      description: 'Get a specific data processing log by ID',
      tags: ['Data Processing Logs'],
      params: LogByIdSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                jobName: { type: 'string' },
                sourceLayer: { type: 'string' },
                targetLayer: { type: 'string' },
                recordsProcessed: { type: 'integer' },
                recordsSucceeded: { type: 'integer' },
                recordsFailed: { type: 'integer' },
                startTime: { type: 'string', format: 'date-time' },
                endTime: { type: 'string', format: 'date-time' },
                status: { type: 'string' },
                errorMessage: { type: 'string' },
                metadata: { type: 'object' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getDataProcessingLogById);

  // Get data processing statistics
  fastify.get('/stats', {
    schema: {
      description: 'Get overall data processing statistics and metrics',
      tags: ['Data Processing Logs'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                overview: {
                  type: 'object',
                  properties: {
                    totalJobs: { type: 'integer' },
                    successfulJobs: { type: 'integer' },
                    failedJobs: { type: 'integer' },
                    runningJobs: { type: 'integer' },
                    successRate: { type: 'number' },
                    totalRecordsProcessed: { type: 'integer' }
                  }
                },
                statusDistribution: { type: 'object' },
                jobNameDistribution: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      jobName: { type: 'string' },
                      count: { type: 'integer' }
                    }
                  }
                },
                recentJobs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      jobName: { type: 'string' },
                      status: { type: 'string' },
                      startTime: { type: 'string', format: 'date-time' },
                      endTime: { type: 'string', format: 'date-time' },
                      recordsProcessed: { type: 'integer' },
                      recordsSucceeded: { type: 'integer' },
                      recordsFailed: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, getDataProcessingStats);

  // Get job performance metrics for a specific job
  fastify.get('/jobs/:jobName/metrics', {
    schema: {
      description: 'Get performance metrics for a specific job',
      tags: ['Data Processing Logs'],
      params: JobPerformanceSchema,
      querystring: JobStatsQuerySchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                jobName: { type: 'string' },
                period: { type: 'string' },
                metrics: {
                  type: 'object',
                  properties: {
                    totalRuns: { type: 'integer' },
                    successfulRuns: { type: 'integer' },
                    failedRuns: { type: 'integer' },
                    successRate: { type: 'number' },
                    avgProcessingTimeSeconds: { type: 'integer' },
                    totalRecordsProcessed: { type: 'integer' },
                    totalRecordsSucceeded: { type: 'integer' },
                    totalRecordsFailed: { type: 'integer' },
                    dataQualityRate: { type: 'number' }
                  }
                },
                recentRuns: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      status: { type: 'string' },
                      startTime: { type: 'string', format: 'date-time' },
                      endTime: { type: 'string', format: 'date-time' },
                      recordsProcessed: { type: 'integer' },
                      recordsSucceeded: { type: 'integer' },
                      recordsFailed: { type: 'integer' },
                      duration: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getJobPerformanceMetrics);

  // Get unique job names for filtering
  fastify.get('/jobs', {
    schema: {
      description: 'Get list of unique job names for filtering',
      tags: ['Data Processing Logs'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  }, getJobNames);

  // Get logs for a specific time period
  fastify.get('/logs/period/:period', {
    schema: {
      description: 'Get logs for a specific time period (today, yesterday, week, month)',
      tags: ['Data Processing Logs'],
      params: TimePeriodSchema,
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
                  jobName: { type: 'string' },
                  sourceLayer: { type: 'string' },
                  targetLayer: { type: 'string' },
                  recordsProcessed: { type: 'integer' },
                  recordsSucceeded: { type: 'integer' },
                  recordsFailed: { type: 'integer' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  status: { type: 'string' },
                  errorMessage: { type: 'string' },
                  metadata: { type: 'object' }
                }
              }
            },
            period: { type: 'string' },
            dateRange: {
              type: 'object',
              properties: {
                startDate: { type: 'string', format: 'date-time' },
                endDate: { type: 'string', format: 'date-time' }
              }
            },
            count: { type: 'integer' }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, getLogsByTimePeriod);
} 