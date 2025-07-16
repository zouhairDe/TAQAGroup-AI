import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('EquipmentHandler');
const prisma = getDatabaseClient();

// Request/Response interfaces
interface CreateEquipmentRequest {
  code: string;
  name: string;
  type: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  installationDate?: Date;
  zoneId: string;
  specifications?: Record<string, any>;
  isActive?: boolean;
}

interface UpdateEquipmentRequest {
  name?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  installationDate?: Date;
  zoneId?: string;
  specifications?: Record<string, any>;
  isActive?: boolean;
  status?: 'operational' | 'maintenance' | 'faulty' | 'decommissioned';
}

interface GetEquipmentQuery {
  page?: number;
  limit?: number;
  type?: string;
  manufacturer?: string;
  zoneId?: string;
  site?: string;
  status?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Handler for equipment management endpoints
 */
export class EquipmentHandler {
  
  /**
   * Get all equipment with filtering and pagination
   */
  async getAllEquipment(
    request: FastifyRequest<{ Querystring: GetEquipmentQuery }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        manufacturer, 
        zoneId, 
        site,
        status,
        isActive, 
        search 
      } = request.query;
      
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (type) where.type = { contains: type, mode: 'insensitive' };
      if (manufacturer) where.manufacturer = { contains: manufacturer, mode: 'insensitive' };
      if (zoneId) where.zoneId = zoneId;
      if (status) where.status = status;
      if (isActive !== undefined) where.isActive = isActive;
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get equipment with related data
      const [equipment, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          skip,
          take: limit,
          include: {
            zone: {
              include: {
                site: true
              }
            },
            anomalies: {
              where: {
                status: { not: 'closed' }
              },
              orderBy: { reportedAt: 'desc' }
            },
            _count: {
              select: {
                anomalies: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.equipment.count({ where })
      ]);

      // Filter by site if specified
      let filteredEquipment = equipment;
      if (site) {
        filteredEquipment = equipment.filter(eq => 
          eq.zone?.site?.name === site
        );
      }

      return {
        success: true,
        data: filteredEquipment,
        meta: {
          page,
          limit,
          total: site ? filteredEquipment.length : total,
          totalPages: Math.ceil((site ? filteredEquipment.length : total) / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting equipment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve equipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get equipment by ID
   */
  async getEquipmentById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const equipment = await prisma.equipment.findUnique({
        where: { id },
        include: {
          zone: {
            include: {
              site: true
            }
          },
          anomalies: {
            include: {
              reportedBy: true,
              assignedTo: true
            },
            orderBy: { reportedAt: 'desc' }
          }
        }
      });

      if (!equipment) {
        reply.code(404);
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      return {
        success: true,
        data: equipment
      };
    } catch (error) {
      logger.error('Error getting equipment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve equipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new equipment
   */
  async createEquipment(
    request: FastifyRequest<{ Body: CreateEquipmentRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        code,
        name,
        type,
        model,
        manufacturer,
        serialNumber,
        installationDate,
        zoneId,
        // specifications, // Not used in current schema
        isActive = true
      } = request.body;

      // Check if zone exists and get siteId
      const zone = await prisma.zone.findUnique({
        where: { id: zoneId },
        include: { site: true }
      });

      if (!zone) {
        reply.code(400);
        return {
          success: false,
          message: 'Zone not found'
        };
      }

      const siteId = zone.siteId;

      // Check if equipment code is unique
      const existingEquipment = await prisma.equipment.findUnique({
        where: { code }
      });

      if (existingEquipment) {
        reply.code(400);
        return {
          success: false,
          message: 'Equipment with this code already exists'
        };
      }

      // Create equipment
      const equipment = await prisma.equipment.create({
        data: {
          code,
          name,
          type,
          model: model || null,
          manufacturer: manufacturer || null,
          serialNumber: serialNumber || null,
          installDate: installationDate || null,
          zoneId,
          siteId,
          // specifications: specifications || {}, // Field not available in current schema
          isActive,
          status: 'operational'
        },
        include: {
          zone: {
            include: {
              site: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Equipment created successfully',
        data: equipment
      };
    } catch (error) {
      logger.error('Error creating equipment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to create equipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update equipment
   */
  async updateEquipment(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateEquipmentRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if equipment exists
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id }
      });

      if (!existingEquipment) {
        reply.code(404);
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      // If updating zone, verify it exists
      if (updateData.zoneId) {
        const zone = await prisma.zone.findUnique({
          where: { id: updateData.zoneId }
        });
        if (!zone) {
          reply.code(400);
          return {
            success: false,
            message: 'Zone not found'
          };
        }
      }

      // Update equipment
      const equipment = await prisma.equipment.update({
        where: { id },
        data: updateData,
        include: {
          zone: {
            include: {
              site: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Equipment updated successfully',
        data: equipment
      };
    } catch (error) {
      logger.error('Error updating equipment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to update equipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete equipment
   */
  async deleteEquipment(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Check if equipment exists
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id }
      });

      if (!existingEquipment) {
        reply.code(404);
        return {
          success: false,
          message: 'Equipment not found'
        };
      }

      // Delete equipment (this will cascade to anomalies and maintenance tasks)
      await prisma.equipment.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Equipment deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting equipment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to delete equipment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get equipment statistics
   */
  async getEquipmentStats(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [
        totalEquipment,
        activeEquipment,
        equipmentByStatus,
        equipmentByType,
        equipmentBySite,
        criticalEquipment
      ] = await Promise.all([
        prisma.equipment.count(),
        prisma.equipment.count({ where: { isActive: true } }),
        prisma.equipment.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.equipment.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        prisma.equipment.findMany({
          include: {
            zone: {
              include: {
                site: true
              }
            }
          }
        }),
        prisma.equipment.findMany({
          where: {
            anomalies: {
              some: {
                priority: 'critical',
                status: { not: 'closed' }
              }
            }
          },
          include: {
            anomalies: {
              where: {
                priority: 'critical',
                status: { not: 'closed' }
              }
            }
          }
        })
      ]);

      // Group by site
      const siteStats = equipmentBySite.reduce((acc, equipment) => {
        const siteName = equipment.zone?.site?.name || 'Unknown';
        acc[siteName] = (acc[siteName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          totalEquipment,
          activeEquipment,
          inactiveEquipment: totalEquipment - activeEquipment,
          statusDistribution: equipmentByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          typeDistribution: equipmentByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          }, {} as Record<string, number>),
          siteDistribution: siteStats,
          criticalEquipmentCount: criticalEquipment.length,
          criticalEquipment: criticalEquipment.slice(0, 5) // Top 5 critical equipment
        }
      };
    } catch (error) {
      logger.error('Error getting equipment stats:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve equipment statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get equipment health overview
   */
  async getEquipmentHealth(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const equipment = await prisma.equipment.findMany({
        include: {
          zone: {
            include: {
              site: true
            }
          }
        }
      });

      const healthData = equipment.map(eq => {
        // Calculate basic health score based on equipment status and age
        let healthScore = 100;
        
        // Adjust score based on equipment status
        switch (eq.status) {
          case 'operational':
            healthScore = 100;
            break;
          case 'maintenance':
            healthScore = 70;
            break;
          case 'faulty':
            healthScore = 30;
            break;
          case 'decommissioned':
            healthScore = 0;
            break;
          default:
            healthScore = 85;
        }

        return {
          id: eq.id,
          code: eq.code,
          name: eq.name,
          type: eq.type,
          site: eq.zone?.site?.name,
          zone: eq.zone?.name,
          healthScore,
          status: eq.status,
          openAnomalies: 0, // Will be populated from separate query if needed
          criticalAnomalies: 0, // Will be populated from separate query if needed
          pendingMaintenance: 0, // Will be populated from separate query if needed
          lastMaintenanceDate: eq.lastMaintenance || eq.updatedAt
        };
      });

      // Sort by health score (worst first)
      healthData.sort((a, b) => a.healthScore - b.healthScore);

      return {
        success: true,
        data: {
          equipmentHealth: healthData,
          summary: {
            totalEquipment: equipment.length,
            healthyEquipment: healthData.filter(eq => eq.healthScore >= 80).length,
            warningEquipment: healthData.filter(eq => eq.healthScore >= 50 && eq.healthScore < 80).length,
            criticalEquipment: healthData.filter(eq => eq.healthScore < 50).length,
            averageHealthScore: healthData.reduce((sum, eq) => sum + eq.healthScore, 0) / healthData.length
          }
        }
      };
    } catch (error) {
      logger.error('Error getting equipment health:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve equipment health data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 