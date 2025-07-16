import { FastifyRequest, FastifyReply } from 'fastify';
import { HealthCheckHandler } from '../handlers/health-check-handler';
import { testDatabaseConnection } from '../../../core/database/client';

// Mock the database client
jest.mock('../../../core/database/client');
const mockTestDatabaseConnection = testDatabaseConnection as jest.MockedFunction<typeof testDatabaseConnection>;

describe('HealthCheckHandler', () => {
  let handler: HealthCheckHandler;
  let mockRequest: FastifyRequest;
  let mockReply: FastifyReply;

  beforeEach(() => {
    handler = new HealthCheckHandler();
    mockRequest = {} as FastifyRequest;
    mockReply = {
      code: jest.fn().mockReturnThis()
    } as unknown as FastifyReply;
    
    jest.clearAllMocks();
  });

  describe('executeBasicHealthCheck', () => {
    it('should return basic health information', async () => {
      // Arrange
      const expectedStatus = 'healthy';
      const expectedEnvironment = 'test';
      process.env.NODE_ENV = expectedEnvironment;

      // Act
      const actualResult = await handler.executeBasicHealthCheck(mockRequest, mockReply);

      // Assert
      expect(actualResult.status).toBe(expectedStatus);
      expect(actualResult.environment).toBe(expectedEnvironment);
      expect(actualResult.timestamp).toBeDefined();
      expect(actualResult.uptime).toBeGreaterThanOrEqual(0);
      expect(mockReply.code).toHaveBeenCalledWith(200);
    });
  });

  describe('executeDetailedHealthCheck', () => {
    it('should return healthy status when database is connected', async () => {
      // Arrange
      mockTestDatabaseConnection.mockResolvedValue(true);

      // Act
      const actualResult = await handler.executeDetailedHealthCheck(mockRequest, mockReply);

      // Assert
      expect(actualResult.status).toBe('healthy');
      expect(actualResult.database.connected).toBe(true);
      expect(actualResult.database.status).toBe('connected');
      expect(actualResult.memory.used).toBeGreaterThan(0);
      expect(actualResult.memory.total).toBeGreaterThan(0);
      expect(actualResult.memory.percentage).toBeGreaterThanOrEqual(0);
      expect(mockReply.code).toHaveBeenCalledWith(200);
    });

    it('should return degraded status when database is disconnected', async () => {
      // Arrange
      mockTestDatabaseConnection.mockResolvedValue(false);

      // Act
      const actualResult = await handler.executeDetailedHealthCheck(mockRequest, mockReply);

      // Assert
      expect(actualResult.status).toBe('degraded');
      expect(actualResult.database.connected).toBe(false);
      expect(actualResult.database.status).toBe('disconnected');
      expect(mockReply.code).toHaveBeenCalledWith(503);
    });

    it('should return unhealthy status when database check throws error', async () => {
      // Arrange
      const expectedError = new Error('Database connection failed');
      mockTestDatabaseConnection.mockRejectedValue(expectedError);

      // Act
      const actualResult = await handler.executeDetailedHealthCheck(mockRequest, mockReply);

      // Assert
      expect(actualResult.status).toBe('unhealthy');
      expect(actualResult.database.connected).toBe(false);
      expect(actualResult.database.status).toBe('error');
      expect(mockReply.code).toHaveBeenCalledWith(503);
    });
  });
}); 