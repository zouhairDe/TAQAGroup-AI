import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';
import { createLogger } from '../../../core/utils/logger';
import { MultipartFile } from '@fastify/multipart';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';
import fs from 'fs/promises';

const logger = createLogger('AnomalyHandler');
const prisma = new PrismaClient();

type ValidStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type ValidSeverity = 'low' | 'medium' | 'critical';
type ValidPriority = 'P1' | 'P2' | 'P3';

// Request/Response interfaces
interface CreateAnomalyRequest {
  equipmentId: string;
  reportedById: string;
  title: string;
  description: string;
  priority?: ValidSeverity; // Frontend format (low, medium, critical) - now optional
  severity?: ValidSeverity; // Now optional
  category: string;
  reportedAt?: Date;
  origin?: string;
  // Add availability factors
  disponibilite?: number;
  fiabilite?: number;
  processSafety?: number;
  // Add other form fields
  sectionProprietaire?: string;
  estimatedTimeToResolve?: string;
}

interface UpdateAnomalyRequest {
  title?: string;
  description?: string;
  priority?: ValidSeverity; // Frontend format (low, medium, critical)
  severity?: ValidSeverity;
  status?: ValidStatus;
  category?: string;
  assignedToId?: string;
  resolvedAt?: Date;
  resolution?: string;
}

interface GetAnomaliesQuery {
  page?: number;
  limit?: number;
  status?: ValidStatus;
  priority?: ValidSeverity; // Frontend format (low, medium, critical)
  severity?: ValidSeverity;
  category?: string;
  equipmentId?: string;
  reportedById?: string;
  assignedToId?: string;
  site?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Handler for anomaly management endpoints
 */
export class AnomalyHandler {
  
  /**
   * Get all anomalies with filtering and pagination
   */
  async getAllAnomalies(
    request: FastifyRequest<{ Querystring: GetAnomaliesQuery }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        priority,
        severity,
        category, 
        equipmentId, 
        reportedById, 
        assignedToId,
        site,
        dateFrom,
        dateTo,
        search 
      } = request.query;
      
      const skip = (page - 1) * limit;

      // Build where clause with proper typing
      const filters: Prisma.AnomalyWhereInput[] = [];

      // Add filters only if they are provided
      if (status) {
        filters.push({ status });
      }
      if (priority) {
        filters.push({ priority });
      }
      if (severity) {
        filters.push({ severity });
      }
      if (category) {
        filters.push({ 
          category: { contains: category, mode: 'insensitive' }
        });
      }
      if (equipmentId) {
        filters.push({ equipmentId });
      }
      if (reportedById) {
        filters.push({ reportedById });
      }
      if (assignedToId) {
        filters.push({ assignedToId });
      }
      
      // Date range filtering
      if (dateFrom || dateTo) {
        const dateFilter: Prisma.DateTimeFilter = {};
        if (dateFrom) dateFilter.gte = new Date(dateFrom);
        if (dateTo) dateFilter.lte = new Date(dateTo);
        filters.push({ reportedAt: dateFilter });
      }

      // Search in title and description
      if (search) {
        filters.push({
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        });
      }

      // Construct the final where clause
      const where: Prisma.AnomalyWhereInput = filters.length > 0 ? { AND: filters } : {};

      // Get anomalies with related data
      const [anomalies, total] = await Promise.all([
        prisma.anomaly.findMany({
          where,
          skip,
          take: limit,
          include: {
            equipment: {
              include: {
                zone: {
                  include: {
                    site: true
                  }
                }
              }
            },
            reportedBy: true,
            assignedTo: true,
            comments: {
              include: {
                author: true
              },
              orderBy: { createdAt: 'desc' }
            },
            attachments: true
          },
          orderBy: [
            { priority: 'desc' },
            { reportedAt: 'desc' }
          ]
        }),
        prisma.anomaly.count({ where })
      ]);

      // Filter by site if specified
      let filteredAnomalies = anomalies;
      if (site) {
        filteredAnomalies = anomalies.filter(anomaly => 
          anomaly.equipment?.zone?.site?.name === site
        );
      }

      return {
        success: true,
        data: filteredAnomalies,
        meta: {
          page,
          limit,
          total: site ? filteredAnomalies.length : total,
          totalPages: Math.ceil((site ? filteredAnomalies.length : total) / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting anomalies:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve anomalies',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get anomaly by ID
   */
  async getAnomalyById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const anomaly = await prisma.anomaly.findUnique({
        where: { id },
        include: {
          equipment: {
            include: {
              zone: {
                include: {
                  site: true
                }
              }
            }
          },
          reportedBy: true,
          assignedTo: true,
          comments: {
            include: {
              author: true
            },
            orderBy: { createdAt: 'desc' }
          },
          attachments: true
        }
      });

      if (!anomaly) {
        reply.code(404);
        return {
          success: false,
          message: 'Anomaly not found'
        };
      }

      return {
        success: true,
        data: anomaly
      };
    } catch (error) {
      logger.error('Error getting anomaly:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve anomaly',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new anomaly
   */
  async createAnomaly(
    request: FastifyRequest<{ Body: CreateAnomalyRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        equipmentId, 
        reportedById, 
        title, 
        description, 
        priority, 
        category,
        reportedAt,
        origin,
        disponibilite,
        fiabilite,
        processSafety,
        sectionProprietaire,
        estimatedTimeToResolve
      } = request.body;

      // Verify user exists (skip equipment validation)
      const reporter = await prisma.user.findUnique({ where: { id: reportedById } });

      if (!reporter) {
        reply.code(400);
        return {
          success: false,
          message: 'Reporter user not found'
        };
      }

      let calculatedPriority: ValidSeverity;
      let calculatedSeverity: ValidSeverity;
      let backendPriority: string;
      let calculatedCriticite: string;
      let finalDisponibilite: number;
      let finalFiabilite: number;
      let finalProcessSafety: number;
      let aiFactors: string[] = [];
      let aiConfidence: number = 0.8;

      // Check if availability factors are provided
      if (disponibilite !== undefined && fiabilite !== undefined && processSafety !== undefined) {
        // Calculate criticality based on availability factors
        finalDisponibilite = disponibilite;
        finalFiabilite = fiabilite;
        finalProcessSafety = processSafety;
        
        const sum = finalDisponibilite + finalFiabilite + finalProcessSafety;
        
        // Apply the same logic as in medallion processor
        if (sum >= 3 && sum <= 6) {
          calculatedPriority = 'low';
          calculatedSeverity = 'low';
          backendPriority = 'P3';
          calculatedCriticite = 'Basse';
        } else if (sum >= 7 && sum <= 8) {
          calculatedPriority = 'medium';
          calculatedSeverity = 'medium';
          backendPriority = 'P2';
          calculatedCriticite = 'Moyenne';
        } else if (sum >= 9) {
          calculatedPriority = 'critical';
          calculatedSeverity = 'critical';
          backendPriority = 'P1';
          calculatedCriticite = 'Critique';
        } else {
          // Fallback for edge cases
          calculatedPriority = 'medium';
          calculatedSeverity = 'medium';
          backendPriority = 'P2';
          calculatedCriticite = 'Moyenne';
        }

        aiFactors = [
          `Fiabilité: ${finalFiabilite}/3`,
          `Disponibilité: ${finalDisponibilite}/3`,
          `Process Safety: ${finalProcessSafety}/3`,
          `Score total: ${sum}/9`
        ];
        aiConfidence = Math.min(0.95, 0.7 + (sum / 30));

        logger.info(`Manual anomaly creation with calculated criticality: sum=${sum}, severity=${calculatedSeverity}, priority=${backendPriority}`);
      } else {
        // Use provided priority or default to medium
        calculatedPriority = priority || 'medium';
        calculatedSeverity = priority || 'medium';
        backendPriority = this.mapFrontendPriorityToBackend(calculatedPriority);
        
        // Set default availability factors
        finalDisponibilite = 2; // Default to medium score
        finalFiabilite = 2;
        finalProcessSafety = 2;
        
        // Set criticite based on priority
        if (calculatedPriority === 'critical') {
          calculatedCriticite = 'Critique';
        } else if (calculatedPriority === 'low') {
          calculatedCriticite = 'Basse';
        } else {
          calculatedCriticite = 'Moyenne';
        }

        logger.info(`Manual anomaly creation with default/provided priority: ${calculatedPriority}, backend: ${backendPriority}`);
      }
      
      // Generate duration to resolve based on severity (in hours)
      let durationToResolve: number;
      if (calculatedSeverity === 'critical') {
        durationToResolve = Math.floor(Math.random() * 24) + 1; // 1-24 hours for critical
      } else if (calculatedSeverity === 'medium') {
        durationToResolve = Math.floor(Math.random() * 168) + 24; // 24-192 hours for medium
      } else {
        durationToResolve = Math.floor(Math.random() * 500) + 168; // 168-668 hours for low
      }

      const estimatedCost = Math.floor(Math.random() * 50000) + 1000; // Random 1000-51000
      const downtimeHours = Math.floor(Math.random() * 48) + 1; // Random 1-48 hours
      const slaHours = this.calculateSLAHours(calculatedSeverity);
      
      // Create anomaly
      const anomaly = await prisma.anomaly.create({
        data: {
          code: `ANO-${Date.now()}`,
          equipmentIdentifier: equipmentId, // Store as free text identifier
          reportedById,
          title,
          description,
          priority: backendPriority, // Store as P1-P3 format
          severity: calculatedSeverity, // Keep calculated severity
          category,
          origin: origin || 'manual',
          reportedAt: reportedAt || new Date(),
          status: 'open',
          durationToResolve,
          estimatedCost,
          downtimeHours,
          slaHours,
          dueDate: new Date(Date.now() + slaHours * 60 * 60 * 1000), // Add SLA hours to current time
          safetyImpact: calculatedSeverity === 'critical',
          environmentalImpact: calculatedSeverity === 'critical',
          productionImpact: calculatedSeverity !== 'low',
          disponibilite: finalDisponibilite,
          fiabilite: finalFiabilite,
          processSafety: finalProcessSafety,
          criticite: calculatedCriticite,
          aiFactors,
          aiConfidence,
          aiSuggestedSeverity: calculatedSeverity
        },
        include: {
          reportedBy: true
        }
      });

      return {
        success: true,
        message: 'Anomaly created successfully',
        data: anomaly
      };
    } catch (error) {
      logger.error('Error creating anomaly:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to create anomaly',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update anomaly
   */
  async updateAnomaly(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateAnomalyRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if anomaly exists
      const existingAnomaly = await prisma.anomaly.findUnique({
        where: { id }
      });

      if (!existingAnomaly) {
        reply.code(404);
        return {
          success: false,
          message: 'Anomaly not found'
        };
      }

      // If assigning to someone, verify user exists
      if (updateData.assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: updateData.assignedToId }
        });
        if (!assignee) {
          reply.code(400);
          return {
            success: false,
            message: 'Assigned user not found'
          };
        }
      }

      // Build database update data with priority conversion
      const dbUpdateData: any = {};
      if (updateData.title !== undefined) dbUpdateData.title = updateData.title;
      if (updateData.description !== undefined) dbUpdateData.description = updateData.description;
      
      // Handle severity/priority updates
      if (updateData.severity !== undefined) {
        dbUpdateData.severity = updateData.severity; // Keep frontend format for severity
        dbUpdateData.priority = this.mapFrontendPriorityToBackend(updateData.severity); // Convert to backend format for priority
      } else if (updateData.priority !== undefined) {
        dbUpdateData.priority = this.mapFrontendPriorityToBackend(updateData.priority);
        dbUpdateData.severity = updateData.priority; // Keep original frontend format
      }
      
      if (updateData.status !== undefined) dbUpdateData.status = updateData.status;
      if (updateData.category !== undefined) dbUpdateData.category = updateData.category;
      if (updateData.assignedToId !== undefined) dbUpdateData.assignedToId = updateData.assignedToId;
      if (updateData.resolvedAt !== undefined) dbUpdateData.resolvedAt = updateData.resolvedAt;

      // Update anomaly
      const anomaly = await prisma.anomaly.update({
        where: { id },
        data: dbUpdateData,
        include: {
          equipment: {
            include: {
              zone: {
                include: {
                  site: true
                }
              }
            }
          },
          reportedBy: true,
          assignedTo: true
        }
      });

      return {
        success: true,
        message: 'Anomaly updated successfully',
        data: anomaly
      };
    } catch (error) {
      logger.error('Error updating anomaly:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to update anomaly',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete anomaly
   */
  async deleteAnomaly(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Check if anomaly exists
      const existingAnomaly = await prisma.anomaly.findUnique({
        where: { id }
      });

      if (!existingAnomaly) {
        reply.code(404);
        return {
          success: false,
          message: 'Anomaly not found'
        };
      }

      // Delete anomaly (this will cascade to comments and attachments)
      await prisma.anomaly.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Anomaly deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting anomaly:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to delete anomaly',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get AI prediction for anomaly creation
   */
  async getAIPrediction(
    request: FastifyRequest<{ Body: { description: string; equipmentId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { description, equipmentId } = request.body;

      if (!description || !equipmentId) {
        reply.code(400);
        return {
          success: false,
          message: 'Description and equipmentId are required'
        };
      }

      // Import AI prediction service
      const { AIPredictionService } = await import('../../../core/services/ai-prediction-service');
      const aiService = new AIPredictionService();

      // Prepare AI prediction request
      const aiRequest = [{
        anomaly_id: `temp-${Date.now()}`,
        description,
        equipment_name: equipmentId,
        equipment_id: equipmentId
      }];

      // Get AI prediction
      const aiResponse = await aiService.getPredictions(aiRequest);

      if ((aiResponse.status === 'success' || aiResponse.status === 'completed') && aiResponse.results.length > 0) {
        const prediction = aiResponse.results[0];
        const mappedFields = aiService.mapPredictionToAnomalyFields(prediction);

        return {
          success: true,
          data: {
            disponibilite: mappedFields.disponibilite,
            fiabilite: mappedFields.fiabilite,
            processSafety: mappedFields.processSafety,
            criticite: mappedFields.criticite,
            severity: mappedFields.severity,
            priority: mappedFields.priority,
            aiConfidence: mappedFields.aiConfidence,
            aiFactors: mappedFields.aiFactors,
            aiSuggestedSeverity: mappedFields.aiSuggestedSeverity
          }
        };
      } else {
        // Return default values if AI prediction fails
        return {
          success: true,
          data: {
            disponibilite: 2,
            fiabilite: 2,
            processSafety: 2,
            criticite: 'Moyenne',
            severity: 'medium',
            priority: 'P2',
            aiConfidence: 0.5,
            aiFactors: ['AI prediction unavailable'],
            aiSuggestedSeverity: 'medium'
          }
        };
      }
    } catch (error) {
      logger.error('Error getting AI prediction:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to get AI prediction',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get anomaly statistics
   */
  async getAnomalyStats(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [
        totalAnomalies,
        anomaliesByStatus,
        anomaliesByPriority,
        recentAnomalies
      ] = await Promise.all([
        prisma.anomaly.count(),
        prisma.anomaly.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.anomaly.groupBy({
          by: ['priority'],
          _count: { priority: true }
        }),
        prisma.anomaly.findMany({
          take: 5,
          orderBy: { reportedAt: 'desc' },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            reportedAt: true,
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                zone: {
                  select: {
                    id: true,
                    name: true,
                    site: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            },
            reportedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })
      ]);

      // Calculate site distribution from recent anomalies
      const siteStats = recentAnomalies.reduce((acc, anomaly) => {
        const siteName = anomaly.equipment?.zone?.site?.name || 'Unknown';
        acc[siteName] = (acc[siteName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        success: true,
        data: {
          totalAnomalies,
          statusDistribution: anomaliesByStatus.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>),
          priorityDistribution: anomaliesByPriority.reduce((acc, item) => {
            acc[item.priority] = item._count.priority;
            return acc;
          }, {} as Record<string, number>),
          siteDistribution: siteStats,
          recentAnomalies
        }
      };
    } catch (error) {
      logger.error('Error getting anomaly stats:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve anomaly statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Map frontend priority format to backend P1-P4 format
   */
  private mapFrontendPriorityToBackend(priority: string): string {
    switch (priority) {
      case 'critical':
        return 'P1';
      case 'medium':
        return 'P2';
      case 'low':
        return 'P3';
      default:
        return 'P2'; // Default to medium
    }
  }

  /**
   * Calculate SLA hours based on severity
   */
  private calculateSLAHours(severity: string): number {
    const slaMatrix: { [key: string]: number } = {
      'critical': 4,
      'medium': 72,
      'low': 168
    };

    return slaMatrix[severity] || 72;
  }

  /**
   * Add comment to anomaly
   */
  async addComment(
    request: FastifyRequest<{ 
      Params: { id: string }; 
      Body: { content: string; authorId: string } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { content, authorId } = request.body;

      // Check if anomaly exists
      const anomaly = await prisma.anomaly.findUnique({
        where: { id }
      });

      if (!anomaly) {
        reply.code(404);
        return {
          success: false,
          message: 'Anomaly not found'
        };
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          content,
          authorId,
          anomalyId: id
        },
        include: {
          author: true
        }
      });

      return {
        success: true,
        message: 'Comment added successfully',
        data: comment
      };
    } catch (error) {
      logger.error('Error adding comment:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async importFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({ error: 'No file uploaded' });
        return;
      }

      // Validate file type
      if (!data.mimetype.includes('csv') && !data.mimetype.includes('text/plain')) {
        reply.status(400).send({ error: 'Invalid file type. Please upload a CSV file.' });
        return;
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const filename = `${Date.now()}-${data.filename}`;
      const filepath = path.join(uploadDir, filename);

      // Save file to disk
      await pipeline(data.file, createWriteStream(filepath));

      // Create file record in database
      const fileRecord = await prisma.fileStorage.create({
        data: {
          filename: data.filename,
          path: filepath,
          mimeType: data.mimetype,
          size: data.file.bytesRead,
          uploadedBy: 'system', // TODO: Get from authenticated user
          status: 'active',
          entityType: 'anomaly_import',
          isPublic: false
        }
      });

      // Start processing in background
      this.processCSVFile(filepath, fileRecord.id).catch((error: Error) => {
        logger.error('Error processing CSV file:', error);
      });

      reply.status(202).send({
        message: 'File uploaded successfully. Processing started.',
        fileId: fileRecord.id
      });

    } catch (error) {
      logger.error('Error handling file upload:', error instanceof Error ? error.message : 'Unknown error');
      reply.status(500).send({ error: 'Failed to process file upload' });
    }
  }

  private async processCSVFile(filepath: string, fileId: string): Promise<void> {
    try {
      const records: any[] = [];
      const parser = createReadStream(filepath).pipe(
        parse({
          columns: true,
          skip_empty_lines: true
        })
      );

      for await (const record of parser) {
        // Save to bronze layer
        await prisma.bronzeAnomaliesRaw.create({
          data: {
            numEquipement: record.numEquipement || record.num_equipement,
            description: record.description,
            dateDetectionAnomalie: record.dateDetectionAnomalie || record.date_detection_anomalie,
            descriptionEquipement: record.descriptionEquipement || record.description_equipement,
            sectionProprietaire: record.sectionProprietaire || record.section_proprietaire,
            sourceFile: filepath,
            rawData: record,
            criticite: record.criticite,
            disponibilite: record.disponibilite,
            fiabiliteIntegrite: record.fiabiliteIntegrite || record.fiabilite_integrite,
            processSafety: record.processSafety || record.process_safety,
            systeme: record.systeme,
            equipmentId: record.equipmentId || record.equipment_id
          }
        });
      }

      // Update file status
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            recordsProcessed: records.length,
            status: 'completed'
          }
        }
      });

      // Create processing log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_csv_import',
          sourceLayer: 'csv',
          targetLayer: 'bronze',
          recordsProcessed: records.length,
          recordsSucceeded: records.length,
          recordsFailed: 0,
          startTime: new Date(),
          endTime: new Date(),
          status: 'completed',
          metadata: {
            fileId,
            filename: path.basename(filepath)
          }
        }
      });

    } catch (error) {
      logger.error('Error processing CSV file:', error instanceof Error ? error.message : 'Unknown error');
      
      // Update file status to error
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
          }
        }
      });

      // Create error log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_csv_import',
          sourceLayer: 'csv',
          targetLayer: 'bronze',
          recordsProcessed: 0,
          recordsSucceeded: 0,
          recordsFailed: 1,
          startTime: new Date(),
          endTime: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            fileId,
            filename: path.basename(filepath)
          }
        }
      });
    }
  }
} 