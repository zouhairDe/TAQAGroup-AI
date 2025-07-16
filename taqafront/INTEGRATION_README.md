# TAQA Dashboard Backend Integration

This document describes the backend integration for the TAQA dashboard page.

## Overview

The dashboard has been successfully integrated with the TAQA backend API to display real-time data instead of mock data. The integration includes:

- **Real-time anomaly statistics** from the backend
- **Live critical alerts** based on actual anomaly data
- **Recent anomalies overview** with filtering and search
- **System health indicators** calculated from real data
- **Auto-refresh functionality** every 30 seconds

## API Integration

### API Service Layer

The integration uses a layered approach:

1. **`/lib/api.ts`** - Base API service with HTTP methods
2. **`/lib/services/dashboard-service.ts`** - Dashboard-specific API calls
3. **`/hooks/use-dashboard.ts`** - React hook for data management
4. **Component updates** - All dashboard components now use real data

### Key API Endpoints Used

- `GET /anomalies/stats/overview` - Anomaly statistics
- `GET /anomalies` - Recent anomalies with pagination
- `GET /anomalies?priority=critical` - Critical anomalies

### Data Flow

```
Backend API → Dashboard Service → useDashboard Hook → Components
```

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend root with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Backend Requirements

Ensure the backend is running on port 3000 with:
- Database seeded with sample data
- CORS enabled for frontend origin
- All anomaly endpoints working

## Features Implemented

### 1. Real-time Dashboard Stats
- Total anomalies count
- Distribution by priority (critical, high, medium, low)
- Distribution by status (new, assigned, in_progress, resolved)
- Performance metrics with targets

### 2. Critical Alerts System
- Real-time critical anomaly detection
- Dismissible alerts
- Contact requirements for critical issues
- Status tracking (new, acknowledged, in_progress)

### 3. Anomalies Overview
- Search functionality
- Status and priority filtering
- Sorting by various fields
- Real-time data with loading states
- Error handling

### 4. System Health Indicators
- Operational status calculation
- Active alerts count
- Intervention tracking
- Performance metrics

## Error Handling

The integration includes comprehensive error handling:

- **Loading states** - Skeleton loaders during data fetching
- **Error states** - User-friendly error messages
- **Retry functionality** - Manual refresh buttons
- **Graceful degradation** - Fallback to empty states

## Performance Optimizations

- **Auto-refresh** - 30-second intervals for real-time updates
- **Parallel API calls** - Multiple endpoints called simultaneously
- **Memoized calculations** - System health indicators cached
- **Debounced search** - Search input optimization

## Testing the Integration

1. **Start the backend:**
   ```bash
   cd taqa-backend
   npm run dev
   ```

2. **Seed the database:**
   ```bash
   npm run db:seed
   ```

3. **Start the frontend:**
   ```bash
   cd taqafront
   npm run dev
   ```

4. **Verify integration:**
   - Dashboard loads with real data
   - Stats update automatically
   - Critical alerts show actual anomalies
   - Search and filtering work

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3001`
   - Check `CORS_ORIGIN` environment variable

2. **API Connection Failed**
   - Verify backend is running on port 3000
   - Check `NEXT_PUBLIC_API_URL` environment variable
   - Ensure database is seeded

3. **No Data Displayed**
   - Check browser console for API errors
   - Verify database has sample data
   - Check network tab for failed requests

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
NEXT_PUBLIC_DEBUG=true
```

## Future Enhancements

- **WebSocket integration** for real-time updates
- **Offline support** with service workers
- **Advanced filtering** with date ranges
- **Export functionality** for reports
- **User authentication** integration
- **Role-based data access**

## API Documentation

For detailed API documentation, visit:
`http://localhost:3000/documentation` (Swagger UI)

## Support

For integration issues:
1. Check the browser console for errors
2. Verify backend logs for API issues
3. Ensure database is properly seeded
4. Test API endpoints directly with tools like Postman 