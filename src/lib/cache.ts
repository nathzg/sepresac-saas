// =====================================================
// Cache Service - Sepresac SaaS
// =====================================================

import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
  enableReadyCheck: false,
  family: 4,
  keepAlive: 30000,
})

export class CacheService {
  private static defaultTTL = 300 // 5 minutos

  static async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status === 'end' || redis.status === 'close') {
        await redis.connect()
      }
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set<T>(key: string, value: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      if (redis.status === 'end' || redis.status === 'close') {
        await redis.connect()
      }
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      if (redis.status === 'end' || redis.status === 'close') {
        await redis.connect()
      }
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redis.status === 'end' || redis.status === 'close') {
        await redis.connect()
      }
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidate pattern error:', error)
    }
  }

  // Cache keys
  static getKeys = {
    userProjects: (userId: string) => `user:${userId}:projects`,
    project: (projectId: string) => `project:${projectId}`,
    projectMembers: (projectId: string) => `project:${projectId}:members`,
    projectEvents: (projectId: string) => `project:${projectId}:events`,
    projectContacts: (projectId: string) => `project:${projectId}:contacts`,
    userNotifications: (userId: string) => `user:${userId}:notifications`,
    dashboardStats: (userId: string) => `user:${userId}:dashboard:stats`,
    userReports: (userId: string, period: string) => `user:${userId}:reports:${period}`,
  }
}
