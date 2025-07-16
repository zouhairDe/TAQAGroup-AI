import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../core/database/client';

// Types
interface MaintenancePeriodRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type?: string;
  status?: string;
  assignedTo?: string;
  location?: string;
}

interface MaintenancePeriodFilters {
  status?: string;
  type?: string;
  year?: number;
  month?: number;
}

// Helper function to calculate duration
function calculateDuration(startDate: Date, endDate: Date) {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const durationHours = durationDays * 24;
  return { durationDays, durationHours };
}

// Helper function to parse Excel date
function parseExcelDate(dateStr: string): Date {
  // Handle formats like "8/1/2025" or "1/8/2025"
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1; // Month is 0-indexed
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  throw new Error(`Invalid date format: ${dateStr}`);
}

/**
 * Get all maintenance periods with optional filtering
 */
export async function getMaintenancePeriods(
  request: FastifyRequest<{ Querystring: MaintenancePeriodFilters }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { status, type, year, month } = request.query;

    const whereClause: any = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year + 1, 0, 1);
      whereClause.startDate = {
        gte: startOfYear,
        lt: endOfYear
      };
    }
    
    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 1);
      whereClause.startDate = {
        gte: startOfMonth,
        lt: endOfMonth
      };
    }

    const periods = await prisma.maintenancePeriod.findMany({
      where: whereClause,
      orderBy: {
        startDate: 'asc'
      },
      include: {
        slots: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    reply.send({
      success: true,
      data: periods,
      total: periods.length
    });
  } catch (error) {
    console.error('Error fetching maintenance periods:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch maintenance periods',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get maintenance period by ID
 */
export async function getMaintenancePeriodById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    const period = await prisma.maintenancePeriod.findUnique({
      where: { id },
      include: {
        slots: {
          include: {
            anomaly: {
              select: {
                id: true,
                code: true,
                title: true,
                severity: true
              }
            },
            assignedTeam: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!period) {
      return reply.status(404).send({
        success: false,
        message: 'Maintenance period not found'
      });
    }

    reply.send({
      success: true,
      data: period
    });
  } catch (error) {
    console.error('Error fetching maintenance period:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch maintenance period',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Create new maintenance period
 */
export async function createMaintenancePeriod(
  request: FastifyRequest<{ Body: MaintenancePeriodRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const {
      title,
      description,
      startDate: startDateStr,
      endDate: endDateStr,
      type = 'maintenance',
      status = 'available',
      assignedTo,
      location
    } = request.body;

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Validate dates
    if (startDate >= endDate) {
      return reply.status(400).send({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const { durationDays, durationHours } = calculateDuration(startDate, endDate);

    const period = await prisma.maintenancePeriod.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        durationDays,
        durationHours,
        type,
        status,
        assignedTo: assignedTo || null,
        location: location || null
      }
    });

    reply.status(201).send({
      success: true,
      data: period,
      message: 'Maintenance period created successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance period:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to create maintenance period',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Update maintenance period
 */
export async function updateMaintenancePeriod(
  request: FastifyRequest<{ Params: { id: string }; Body: Partial<MaintenancePeriodRequest> }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;
    const updateData = request.body;

    // Check if period exists
    const existingPeriod = await prisma.maintenancePeriod.findUnique({
      where: { id }
    });

    if (!existingPeriod) {
      return reply.status(404).send({
        success: false,
        message: 'Maintenance period not found'
      });
    }

    // Recalculate duration if dates are being updated
    let durationUpdate = {};
    if (updateData.startDate || updateData.endDate) {
      const startDate = updateData.startDate ? new Date(updateData.startDate) : existingPeriod.startDate;
      const endDate = updateData.endDate ? new Date(updateData.endDate) : existingPeriod.endDate;
      
      if (startDate >= endDate) {
        return reply.status(400).send({
          success: false,
          message: 'End date must be after start date'
        });
      }

      const { durationDays, durationHours } = calculateDuration(startDate, endDate);
      durationUpdate = { durationDays, durationHours };
    }

    const updatedPeriod = await prisma.maintenancePeriod.update({
      where: { id },
      data: {
        ...updateData,
        ...durationUpdate,
        startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
        endDate: updateData.endDate ? new Date(updateData.endDate) : undefined
      }
    });

    reply.send({
      success: true,
      data: updatedPeriod,
      message: 'Maintenance period updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance period:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to update maintenance period',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Delete maintenance period
 */
export async function deleteMaintenancePeriod(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    // Check if period exists
    const existingPeriod = await prisma.maintenancePeriod.findUnique({
      where: { id },
      include: {
        slots: true
      }
    });

    if (!existingPeriod) {
      return reply.status(404).send({
        success: false,
        message: 'Maintenance period not found'
      });
    }

    // Check if period has associated slots
    if (existingPeriod.slots.length > 0) {
      return reply.status(400).send({
        success: false,
        message: 'Cannot delete maintenance period with associated slots'
      });
    }

    await prisma.maintenancePeriod.delete({
      where: { id }
    });

    reply.send({
      success: true,
      message: 'Maintenance period deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting maintenance period:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to delete maintenance period',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Import maintenance periods from Excel data
 */
export async function importMaintenancePeriods(
  request: FastifyRequest<{ Body: { periods: Array<{ title?: string; startDate: string; endDate: string; durationDays?: number | string; durationHours?: number | string }> } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { periods } = request.body;

    if (!periods || !Array.isArray(periods)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid periods data'
      });
    }

    const createdPeriods = [];
    const errors = [];

    for (let i = 0; i < periods.length; i++) {
      try {
        const periodData = periods[i];
        
        // Handle both Excel-style dates and ISO format dates
        const startDate = new Date(periodData.startDate);
        const endDate = new Date(periodData.endDate);
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error('Invalid date format');
        }
        
        if (startDate >= endDate) {
          throw new Error('End date must be after start date');
        }
        
        // Calculate duration if not provided, ensuring proper type conversion
        let durationDays: number;
        let durationHours: number;
        
        if (periodData.durationDays && periodData.durationHours) {
          // Convert string values to numbers if needed
          durationDays = typeof periodData.durationDays === 'string' ? parseInt(periodData.durationDays, 10) : periodData.durationDays;
          durationHours = typeof periodData.durationHours === 'string' ? parseInt(periodData.durationHours, 10) : periodData.durationHours;
          
          // Validate converted values
          if (isNaN(durationDays) || isNaN(durationHours) || durationDays <= 0 || durationHours <= 0) {
            throw new Error('Invalid duration values');
          }
        } else {
          // Calculate duration from dates
          const calculated = calculateDuration(startDate, endDate);
          durationDays = calculated.durationDays;
          durationHours = calculated.durationHours;
        }

        // Generate title if not provided
        const title = periodData.title || `Période ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;

        // Create description
        const description = `Période importée du ${startDate.toLocaleDateString('fr-FR')} au ${endDate.toLocaleDateString('fr-FR')}`;

        const period = await prisma.maintenancePeriod.create({
          data: {
            title,
            description,
            startDate,
            endDate,
            durationDays,
            durationHours,
            type: 'maintenance',
            status: 'available'
          }
        });

        createdPeriods.push(period);
      } catch (error) {
        console.error('Error creating period:', error);
        errors.push({
          index: i,
          data: periods[i],
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    reply.send({
      success: true,
      data: {
        created: createdPeriods,
        errors: errors,
        total: periods.length,
        successful: createdPeriods.length,
        failed: errors.length
      },
      message: `Import completed: ${createdPeriods.length} periods created, ${errors.length} errors`
    });
  } catch (error) {
    console.error('Error importing maintenance periods:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to import maintenance periods',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get maintenance statistics
 */
export async function getMaintenanceStatistics(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const [
      totalPeriods,
      availablePeriods,
      bookedPeriods,
      pendingPeriods,
      totalDays,
      totalHours
    ] = await Promise.all([
      prisma.maintenancePeriod.count(),
      prisma.maintenancePeriod.count({ where: { status: 'available' } }),
      prisma.maintenancePeriod.count({ where: { status: 'booked' } }),
      prisma.maintenancePeriod.count({ where: { status: 'pending' } }),
      prisma.maintenancePeriod.aggregate({ _sum: { durationDays: true } }),
      prisma.maintenancePeriod.aggregate({ _sum: { durationHours: true } })
    ]);

    const stats = {
      totalPeriods,
      availablePeriods,
      bookedPeriods,
      pendingPeriods,
      totalDays: totalDays._sum.durationDays || 0,
      totalHours: totalHours._sum.durationHours || 0,
      availabilityRate: totalPeriods > 0 ? ((availablePeriods / totalPeriods) * 100).toFixed(1) : '100.0'
    };

    reply.send({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching maintenance statistics:', error);
    reply.status(500).send({
      success: false,
      message: 'Failed to fetch maintenance statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 