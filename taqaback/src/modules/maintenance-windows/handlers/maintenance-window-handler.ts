import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../../core/utils/logger';
import * as XLSX from 'xlsx';
import path from 'path';

const logger = createLogger('MaintenanceWindowHandler');
const prisma = new PrismaClient();

export interface MaintenanceWindowCreateRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type?: string;
  assignedTo?: string;
  location?: string;
}

export interface MaintenanceWindowUpdateRequest extends Partial<MaintenanceWindowCreateRequest> {
  status?: 'available' | 'booked' | 'pending';
}

export interface MaintenanceWindowQueryParams {
  month?: number;
  year?: number;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class MaintenanceWindowHandler {
  /**
   * Get all maintenance windows with optional filtering
   */
  static async getAllMaintenanceWindows(
    request: FastifyRequest<{ Querystring: MaintenanceWindowQueryParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { month, year, status, type, page = 1, limit = 50 } = request.query;
      const offset = (page - 1) * limit;

      const where: any = {};
      
      if (month) where.month = month;
      if (year) where.year = year;
      if (status) where.status = status;
      if (type) where.type = type;

      const [maintenanceWindows, total] = await Promise.all([
        prisma.maintenanceWindow.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: [
            { year: 'asc' },
            { month: 'asc' },
            { startDate: 'asc' }
          ],
          include: {
            slots: {
              select: {
                id: true,
                code: true,
                title: true,
                status: true,
                anomaly: {
                  select: {
                    id: true,
                    code: true,
                    title: true,
                    severity: true
                  }
                }
              }
            }
          }
        }),
        prisma.maintenanceWindow.count({ where })
      ]);

      reply.send({
        success: true,
        data: {
          maintenanceWindows,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching maintenance windows:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la récupération des créneaux de maintenance'
      });
    }
  }

  /**
   * Get maintenance window by ID
   */
  static async getMaintenanceWindowById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;

      const maintenanceWindow = await prisma.maintenanceWindow.findUnique({
        where: { id },
        include: {
          slots: {
            include: {
              anomaly: {
                select: {
                  id: true,
                  code: true,
                  title: true,
                  severity: true,
                  status: true
                }
              },
              assignedTeam: {
                select: {
                  id: true,
                  name: true,
                  type: true
                }
              },
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!maintenanceWindow) {
        reply.status(404).send({
          success: false,
          message: 'Créneau de maintenance non trouvé'
        });
        return;
      }

      reply.send({
        success: true,
        data: maintenanceWindow
      });
    } catch (error) {
      logger.error('Error fetching maintenance window:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la récupération du créneau de maintenance'
      });
    }
  }

  /**
   * Create new maintenance window
   */
  static async createMaintenanceWindow(
    request: FastifyRequest<{ Body: MaintenanceWindowCreateRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { title, description, startDate, endDate, type = 'maintenance', assignedTo, location } = request.body;

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate dates
      if (start >= end) {
        reply.status(400).send({
          success: false,
          message: 'La date de fin doit être postérieure à la date de début'
        });
        return;
      }

      // Calculate duration
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const durationHours = durationDays * 24;

      // Get month and year from start date
      const month = start.getMonth() + 1; // getMonth() returns 0-11
      const year = start.getFullYear();

      const maintenanceWindow = await prisma.maintenanceWindow.create({
        data: {
          title,
          description,
          startDate: start,
          endDate: end,
          durationDays,
          durationHours,
          month,
          year,
          type,
          assignedTo,
          location,
          status: 'available'
        }
      });

      logger.info(`Created maintenance window: ${maintenanceWindow.id}`);

      reply.status(201).send({
        success: true,
        message: 'Créneau de maintenance créé avec succès',
        data: maintenanceWindow
      });
    } catch (error) {
      logger.error('Error creating maintenance window:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la création du créneau de maintenance'
      });
    }
  }

  /**
   * Update maintenance window
   */
  static async updateMaintenanceWindow(
    request: FastifyRequest<{ Params: { id: string }; Body: MaintenanceWindowUpdateRequest }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if maintenance window exists
      const existingWindow = await prisma.maintenanceWindow.findUnique({
        where: { id }
      });

      if (!existingWindow) {
        reply.status(404).send({
          success: false,
          message: 'Créneau de maintenance non trouvé'
        });
        return;
      }

      // Prepare update data
      const dataToUpdate: any = { ...updateData };

      // If dates are being updated, recalculate duration and month/year
      if (updateData.startDate || updateData.endDate) {
        const start = updateData.startDate ? new Date(updateData.startDate) : existingWindow.startDate;
        const end = updateData.endDate ? new Date(updateData.endDate) : existingWindow.endDate;

        if (start >= end) {
          reply.status(400).send({
            success: false,
            message: 'La date de fin doit être postérieure à la date de début'
          });
          return;
        }

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const durationHours = durationDays * 24;

        dataToUpdate.startDate = start;
        dataToUpdate.endDate = end;
        dataToUpdate.durationDays = durationDays;
        dataToUpdate.durationHours = durationHours;
        dataToUpdate.month = start.getMonth() + 1;
        dataToUpdate.year = start.getFullYear();
      }

      const updatedWindow = await prisma.maintenanceWindow.update({
        where: { id },
        data: dataToUpdate
      });

      logger.info(`Updated maintenance window: ${id}`);

      reply.send({
        success: true,
        message: 'Créneau de maintenance mis à jour avec succès',
        data: updatedWindow
      });
    } catch (error) {
      logger.error('Error updating maintenance window:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la mise à jour du créneau de maintenance'
      });
    }
  }

  /**
   * Delete maintenance window
   */
  static async deleteMaintenanceWindow(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { id } = request.params;

      // Check if maintenance window exists
      const existingWindow = await prisma.maintenanceWindow.findUnique({
        where: { id },
        include: {
          slots: true
        }
      });

      if (!existingWindow) {
        reply.status(404).send({
          success: false,
          message: 'Créneau de maintenance non trouvé'
        });
        return;
      }

      // Check if there are associated slots
      if (existingWindow.slots.length > 0) {
        reply.status(400).send({
          success: false,
          message: 'Impossible de supprimer un créneau de maintenance avec des créneaux assignés'
        });
        return;
      }

      await prisma.maintenanceWindow.delete({
        where: { id }
      });

      logger.info(`Deleted maintenance window: ${id}`);

      reply.send({
        success: true,
        message: 'Créneau de maintenance supprimé avec succès'
      });
    } catch (error) {
      logger.error('Error deleting maintenance window:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la suppression du créneau de maintenance'
      });
    }
  }

  /**
   * Import maintenance windows from Excel/CSV file
   */
  static async importMaintenanceWindows(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({
          success: false,
          message: 'Aucun fichier fourni'
        });
        return;
      }

      const buffer = await data.toBuffer();
      const filename = data.filename.toLowerCase();

      let workbook: XLSX.WorkBook;

      // Parse file based on extension
      if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
        workbook = XLSX.read(buffer, { type: 'buffer' });
      } else if (filename.endsWith('.csv')) {
        workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
      } else {
        reply.status(400).send({
          success: false,
          message: 'Format de fichier non supporté. Utilisez .xlsx, .xls ou .csv'
        });
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const importedWindows = [];
      const errors = [];

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const row: any = jsonData[i];
          
          // Handle different possible column names
          const startDateValue = row['Date début d\'Arrét (Window)'] || 
                                 row['Date début d\'Arrêt (Window)'] || 
                                 row['Start Date'] || 
                                 row['startDate'];
          
          const endDateValue = row['Date fin d\'Arrét (Window)'] || 
                               row['Date fin d\'Arrêt (Window)'] || 
                               row['End Date'] || 
                               row['endDate'];

          if (!startDateValue || !endDateValue) {
            errors.push(`Ligne ${i + 2}: Dates de début et fin requises`);
            continue;
          }

          // Parse dates (handle Excel date numbers and string formats)
          let startDate: Date;
          let endDate: Date;

          if (typeof startDateValue === 'number') {
            startDate = new Date((startDateValue - 25569) * 86400 * 1000);
          } else {
            startDate = new Date(startDateValue);
          }

          if (typeof endDateValue === 'number') {
            endDate = new Date((endDateValue - 25569) * 86400 * 1000);
          } else {
            endDate = new Date(endDateValue);
          }

          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            errors.push(`Ligne ${i + 2}: Format de date invalide`);
            continue;
          }

          if (startDate >= endDate) {
            errors.push(`Ligne ${i + 2}: La date de fin doit être postérieure à la date de début`);
            continue;
          }

          // Calculate duration
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const durationHours = durationDays * 24;

          // Get month and year from start date
          const month = startDate.getMonth() + 1;
          const year = startDate.getFullYear();

          // Generate title
          const title = `Maintenance ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;

          const maintenanceWindow = await prisma.maintenanceWindow.create({
            data: {
              title,
              description: `Période de maintenance importée - ${durationDays} jours`,
              startDate,
              endDate,
              durationDays,
              durationHours,
              month,
              year,
              type: 'maintenance',
              status: 'available'
            }
          });

          importedWindows.push(maintenanceWindow);

        } catch (error) {
          errors.push(`Ligne ${i + 2}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
          logger.error(`Error processing row ${i + 2}:`, error);
        }
      }

      logger.info(`Imported ${importedWindows.length} maintenance windows with ${errors.length} errors`);

      reply.send({
        success: true,
        message: `Import terminé: ${importedWindows.length} créneaux importés`,
        data: {
          imported: importedWindows.length,
          errors: errors.length,
          maintenanceWindows: importedWindows,
          errorDetails: errors
        }
      });

    } catch (error) {
      logger.error('Error importing maintenance windows:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de l\'import des créneaux de maintenance'
      });
    }
  }

  /**
   * Get maintenance window statistics
   */
  static async getMaintenanceWindowStats(
    request: FastifyRequest<{ Querystring: { year?: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { year = new Date().getFullYear() } = request.query;

      const [totalWindows, availableWindows, bookedWindows, totalDays] = await Promise.all([
        prisma.maintenanceWindow.count({ where: { year } }),
        prisma.maintenanceWindow.count({ where: { year, status: 'available' } }),
        prisma.maintenanceWindow.count({ where: { year, status: 'booked' } }),
        prisma.maintenanceWindow.aggregate({
          where: { year },
          _sum: { durationDays: true }
        })
      ]);

      const availability = totalDays._sum.durationDays 
        ? 100 - (totalDays._sum.durationDays / 365 * 100)
        : 100;

      reply.send({
        success: true,
        data: {
          totalWindows,
          availableWindows,
          bookedWindows,
          pendingWindows: totalWindows - availableWindows - bookedWindows,
          totalDays: totalDays._sum.durationDays || 0,
          availability: parseFloat(availability.toFixed(1)),
          year
        }
      });
    } catch (error) {
      logger.error('Error fetching maintenance window statistics:', error);
      reply.status(500).send({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      });
    }
  }
} 