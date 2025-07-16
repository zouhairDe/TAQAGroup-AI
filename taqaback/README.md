# TAQA Backend - Anomaly Management System

This is the backend API for the TAQA anomaly management system, built for the TAQATHON hackathon. The system manages equipment anomalies using a modern medallion architecture pattern.

## 🏗️ Medallion Architecture

The **Medallion Architecture** (also known as Multi-Hop Architecture) is a data design pattern used to logically organize data in a lakehouse, with the goal of incrementally improving the quality of data as it flows through three distinct layers:

### Bronze Layer (Raw Data)
- **Purpose**: Ingests and stores raw data in its original format
- **Characteristics**:
  - Minimal processing or transformation
  - Preserves original data structure and format
  - Acts as a landing zone for all incoming data
  - Maintains data lineage and audit trails

### Silver Layer (Cleaned and Refined Data)
- **Purpose**: Cleanses, validates, and standardizes data from Bronze layer
- **Characteristics**:
  - Data cleansing (remove duplicates, handle nulls)
  - Data validation and quality checks
  - Schema enforcement and standardization
  - Basic transformations and enrichment
  - Optimized for analytics and reporting

### Gold Layer (Business-Ready Data)
- **Purpose**: Provides business-ready, aggregated data for analytics and ML
- **Characteristics**:
  - Highly aggregated and curated datasets
  - Business logic applied
  - Optimized for specific use cases
  - Ready for consumption by BI tools and applications
  - Performance optimized with proper indexing

## 📅 Slotting System

The **Slotting System** is an advanced maintenance scheduling feature that allows managers to efficiently plan and execute anomaly repairs within predefined maintenance windows. This system addresses the complex scheduling needs of industrial facilities where maintenance must be carefully coordinated to minimize production impact.

### Key Features

#### Flexible Date Scheduling
- **Split Scheduling**: Anomaly fixes can be distributed across multiple non-consecutive dates
- **Resource Optimization**: Allows optimal allocation of teams and resources
- **Production Impact Minimization**: Work can be scheduled during planned downtimes

#### Maintenance Windows
The system operates with predefined maintenance windows based on operational requirements:
- **January Window**: 8/1/2025 - 8/7/2025 (7 days, 168 hours)
- **February Window**: 9/2/2025 - 9/5/2025 (4 days, 96 hours)  
- **Extended Window**: 2/1/2026 - 3/2/2026 (30 days, 720 hours)

#### Comprehensive Management
- **Status Tracking**: scheduled → in_progress → completed
- **Cost Management**: Estimated vs. actual cost tracking
- **Team Assignment**: Flexible team and individual assignments
- **Safety Integration**: Safety precautions and resource requirements
- **Impact Assessment**: Production and downtime impact analysis

### Example Usage

```typescript
// Create a maintenance slot
const slot = {
  title: "Turbine Maintenance - January 2025",
  anomalyId: "anom-123",
  dates: [
    "2025-01-10T08:00:00.000Z",  // Day 1-2: Preparation
    "2025-01-11T08:00:00.000Z",
    "2025-01-20T08:00:00.000Z"   // Day 3: Final testing
  ],
  estimatedDuration: 24,
  priority: "high",
  windowType: "planned",
  safetyPrecautions: ["Electrical isolation", "Safety zone"],
  resourcesNeeded: ["Specialized team", "Spare parts"]
}
```

### Business Benefits
- **Improved Planning**: Better coordination of maintenance activities
- **Reduced Downtime**: Optimal scheduling reduces production impact  
- **Cost Control**: Accurate cost tracking and resource allocation
- **Compliance**: Structured approach ensures safety and regulatory compliance
- **Flexibility**: Adaptive scheduling accommodates changing priorities

## 🎯 Project Context

This backend system is designed for the TAQATHON hackathon, focusing on managing important equipment anomalies in industrial settings. The system processes anomaly data through the medallion architecture layers to provide reliable, clean, and actionable insights.

### Key Features
- **Equipment Anomaly Management**: Track and manage equipment failures and issues
- **Priority-Based Classification**: Categorize anomalies by priority levels
- **Section-Based Organization**: Organize equipment by operational sections
- **Flexible Maintenance Scheduling**: Advanced slotting system for maintenance window management
- **Split Date Scheduling**: Schedule anomaly fixes across multiple non-consecutive periods
- **Real-time Health Monitoring**: Monitor system health and database connectivity
- **RESTful API**: Clean, documented API endpoints for frontend integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taqa-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # (Optional) Seed the database
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3333`

## 📁 Project Structure

```
src/
├── core/                    # Core application infrastructure
│   ├── config/             # Configuration management
│   ├── database/           # Database client and utilities
│   ├── server/             # Server setup and plugins
│   ├── utils/              # Shared utilities
│   └── test/               # Test configuration
├── modules/                # Feature modules
│   ├── health/             # Health check module
│   │   ├── handlers/       # Request handlers
│   │   ├── routes/         # Route definitions
│   │   └── tests/          # Unit tests
│   └── anomalies/          # Anomaly management module (to be created)
└── index.ts                # Application entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint the codebase
- `npm run lint:fix` - Fix linting issues automatically
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with sample data

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
- **Swagger UI**: http://localhost:3333/documentation

### Available Endpoints

#### Health Check
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed health check with database status

#### Slotting System
- `GET /api/v1/slots` - Get all maintenance slots
- `GET /api/v1/slots/:id` - Get slot by ID
- `POST /api/v1/slots` - Create new maintenance slot
- `PUT /api/v1/slots/:id` - Update slot
- `DELETE /api/v1/slots/:id` - Delete slot
- `GET /api/v1/slots/anomaly/:anomalyId` - Get slots by anomaly
- `GET /api/v1/slots/available-windows` - Get available maintenance windows

## 🏛️ Architecture Principles

### Modular Design
- Each feature is organized in its own module
- Clear separation of concerns between layers
- Dependency injection for better testability

### Clean Code Standards
- TypeScript with strict typing
- Comprehensive error handling
- Extensive logging and monitoring
- Unit tests for all business logic

### Database Design
- PostgreSQL with Prisma ORM
- Proper indexing for performance
- Migration-based schema management
- Connection pooling and health monitoring

### Security
- CORS protection
- Helmet for security headers
- Input validation and sanitization
- Environment-based configuration

## 🧪 Testing

The project uses Jest for testing with the following conventions:
- Unit tests for all handlers and services
- Integration tests for API endpoints
- Test doubles (mocks/stubs) for external dependencies
- Arrange-Act-Assert pattern for test structure

Run tests:
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

## 🔄 Development Workflow

1. **Feature Development**
   - Create feature branch from main
   - Implement feature following the modular structure
   - Write comprehensive tests
   - Ensure linting passes

2. **Code Quality**
   - Follow TypeScript best practices
   - Use proper error handling
   - Add JSDoc documentation for public APIs
   - Maintain test coverage above 80%

3. **Database Changes**
   - Create Prisma migrations for schema changes
   - Update seed data if necessary
   - Test migrations on development database

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)

### Production Build
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Follow the established coding standards
2. Write tests for new features
3. Update documentation as needed
4. Follow the modular architecture pattern
5. Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for the TAQATHON hackathon using Fastify, TypeScript, and Prisma.

## 🔄 Data Processing Flow (As Implemented)

This section describes the exact process of data flow and transformation between the layers of the medallion architecture in this backend, as implemented in the codebase:

### 1. Data Ingestion (Bronze Layer)
- **Service:** `CSVImportService` (`src/core/services/csv-import-service.ts`)
- **Process:**
  - Raw anomaly data is ingested via CSV file upload or direct file import.
  - The service parses the CSV, maps columns to the expected schema, and inserts each row as a record in the `bronzeAnomaliesRaw` table.
  - Minimal validation is performed; the goal is to preserve the original data for traceability.
  - Each record is marked as unprocessed and includes metadata such as the source file and import timestamp.

### 2. Data Cleansing & Validation (Bronze → Silver)
- **Service:** `MedallionDataProcessor` (`src/core/services/medallion-data-processor.ts`)
- **Process:**
  - The `processBronzeToSilver` method retrieves all unprocessed records from the Bronze layer.
  - For each record:
    - Cleansing and validation are performed (e.g., required fields, date parsing, normalization of status and priority, equipment categorization, and data quality scoring).
    - If valid, the cleansed record is inserted into the `silverAnomaliesClean` table (Silver layer), and the original Bronze record is marked as processed.
    - If invalid, the record is skipped and logged as a failure.
  - Processing logs are maintained in the `dataProcessingLog` table, tracking counts and status.

### 3. Data Aggregation & Business Logic (Silver → Gold)
- **Service:** `MedallionDataProcessor` (`src/core/services/medallion-data-processor.ts`)
- **Process:**
  - The `processSilverToGold` method aggregates and transforms cleansed data from the Silver layer into business-ready datasets in the Gold layer.
  - This includes:
    - Generating anomaly summaries by section, equipment category, priority, and status.
    - Calculating equipment health metrics and section performance metrics (aggregation logic).
    - Results are upserted into the `goldAnomalySummary` and other Gold tables, ready for analytics and reporting.
  - Each run is logged for traceability and auditing.

### 4. API Exposure
- **Routes:** Registered in `registerMedallionRoutes` and exposed under `/api/v1/medallion`.
- **Handlers:** Trigger the above services for data import, processing, and reporting.
- **Documentation:** All endpoints are documented via Swagger UI at `/documentation`.

### 5. Logging & Monitoring
- **Logger:** All steps are logged with context, color-coded output, and error stack traces for easy debugging.
- **Health Checks:** `/api/v1/health` endpoints monitor system and database status.

---

**Summary:**
- Data flows from raw CSV (Bronze) → cleansed and validated (Silver) → aggregated and business-ready (Gold).
- Each layer improves data quality and adds value, following the medallion architecture best practices.
- The process is fully automated, logged, and auditable, with clear separation of concerns between services and layers.
