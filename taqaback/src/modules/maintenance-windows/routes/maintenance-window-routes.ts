import { FastifyInstance } from 'fastify';
import { MaintenanceWindowHandler } from '../handlers/maintenance-window-handler';

/**
 * Register maintenance window routes
 */
export async function registerMaintenanceWindowRoutes(server: FastifyInstance): Promise<void> {
  // Swagger schemas
  const maintenanceWindowSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      durationDays: { type: 'integer' },
      durationHours: { type: 'integer' },
      month: { type: 'integer', minimum: 1, maximum: 12 },
      year: { type: 'integer' },
      status: { type: 'string', enum: ['available', 'booked', 'pending'] },
      type: { type: 'string', enum: ['maintenance', 'repair', 'inspection', 'emergency'] },
      assignedTo: { type: 'string' },
      location: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  };

  const createMaintenanceWindowSchema = {
    type: 'object',
    required: ['title', 'startDate', 'endDate'],
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      type: { type: 'string', enum: ['maintenance', 'repair', 'inspection', 'emergency'] },
      assignedTo: { type: 'string' },
      location: { type: 'string' }
    }
  };

  const updateMaintenanceWindowSchema = {
    type: 'object',
    properties: {
      title: { type: 'string', minLength: 1 },
      description: { type: 'string' },
      startDate: { type: 'string', format: 'date-time' },
      endDate: { type: 'string', format: 'date-time' },
      status: { type: 'string', enum: ['available', 'booked', 'pending'] },
      type: { type: 'string', enum: ['maintenance', 'repair', 'inspection', 'emergency'] },
      assignedTo: { type: 'string' },
      location: { type: 'string' }
    }
  };

  // Get all maintenance windows
  server.get('/', {
    schema: {
      description: 'Get all maintenance windows with optional filtering',
      tags: ['Maintenance Windows'],
      querystring: {
        type: 'object',
        properties: {
          month: { type: 'integer', minimum: 1, maximum: 12 },
          year: { type: 'integer' },
          status: { type: 'string', enum: ['available', 'booked', 'pending'] },
          type: { type: 'string', enum: ['maintenance', 'repair', 'inspection', 'emergency'] },
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                maintenanceWindows: {
                  type: 'array',
                  items: {
                    allOf: [
                      maintenanceWindowSchema,
                      {
                        type: 'object',
                        properties: {
                          slots: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                code: { type: 'string' },
                                title: { type: 'string' },
                                status: { type: 'string' },
                                anomaly: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    code: { type: 'string' },
                                    title: { type: 'string' },
                                    severity: { type: 'string' }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    totalPages: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, MaintenanceWindowHandler.getAllMaintenanceWindows);

  // Get maintenance window by ID
  server.get('/:id', {
    schema: {
      description: 'Get maintenance window by ID',
      tags: ['Maintenance Windows'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: maintenanceWindowSchema
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
  }, MaintenanceWindowHandler.getMaintenanceWindowById);

  // Create new maintenance window
  server.post('/', {
    schema: {
      description: 'Create a new maintenance window',
      tags: ['Maintenance Windows'],
      body: createMaintenanceWindowSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: maintenanceWindowSchema
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
  }, MaintenanceWindowHandler.createMaintenanceWindow);

  // Update maintenance window
  server.put('/:id', {
    schema: {
      description: 'Update maintenance window',
      tags: ['Maintenance Windows'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: updateMaintenanceWindowSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: maintenanceWindowSchema
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
  }, MaintenanceWindowHandler.updateMaintenanceWindow);

  // Delete maintenance window
  server.delete('/:id', {
    schema: {
      description: 'Delete maintenance window',
      tags: ['Maintenance Windows'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
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
  }, MaintenanceWindowHandler.deleteMaintenanceWindow);

  // Import maintenance windows from CSV
  server.post('/import', {
    schema: {
      description: 'Import maintenance windows from CSV',
      tags: ['Maintenance Windows'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                imported: { type: 'integer' },
                failed: { type: 'integer' },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      row: { type: 'integer' },
                      error: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, MaintenanceWindowHandler.importMaintenanceWindows);

  // Get maintenance window statistics
  server.get('/stats', {
    schema: {
      description: 'Get maintenance window statistics',
      tags: ['Maintenance Windows'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                available: { type: 'integer' },
                booked: { type: 'integer' },
                pending: { type: 'integer' },
                byType: {
                  type: 'object',
                  properties: {
                    maintenance: { type: 'integer' },
                    repair: { type: 'integer' },
                    inspection: { type: 'integer' },
                    emergency: { type: 'integer' }
                  }
                },
                byMonth: {
                  type: 'object',
                  additionalProperties: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  }, MaintenanceWindowHandler.getMaintenanceWindowStats);
} 