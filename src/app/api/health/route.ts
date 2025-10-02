import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Health Check Endpoint
 * Returns system status and checks critical services
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connection
    const dbStatus = await checkDatabase();

    // Check memory usage
    const memoryUsage = process.memoryUsage();

    // Calculate uptime
    const uptime = process.uptime();

    // Response time
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '2.1.0',
      uptime: {
        seconds: Math.floor(uptime),
        human: formatUptime(uptime),
      },
      checks: {
        database: dbStatus,
      },
      performance: {
        responseTime: `${responseTime}ms`,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          percentage: `${Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)}%`,
        },
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: `${Date.now() - startTime}ms`,
      },
      { status: 503 }
    );
  }
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{
  status: 'ok' | 'error';
  responseTime?: string;
  error?: string;
}> {
  const start = Date.now();

  try {
    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      responseTime: `${Date.now() - start}ms`,
    };
  } catch (error) {
    console.error('Database health check failed:', error);

    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - start}ms`,
    };
  }
}

/**
 * Format uptime in human-readable format
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
