import { NextRequest } from 'next/server'
import { POST } from '../login/route'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
}))

import { prisma } from '@/lib/db'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'administrador',
      company: 'Test Company',
      isActive: true,
      emailVerified: new Date(),
    }

    mockPrisma.user.findFirst.mockResolvedValue(mockUser as any)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('user')
    expect(data.user.email).toBe('test@example.com')
    expect(data.user).not.toHaveProperty('password')
  })

  it('should fail with invalid email', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)

    const requestBody = {
      email: 'nonexistent@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Credenciales inválidas')
  })

  it('should fail with invalid password', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'administrador',
      company: 'Test Company',
      isActive: true,
      emailVerified: new Date(),
    }

    mockPrisma.user.findFirst.mockResolvedValue(mockUser as any)
    mockBcrypt.compare.mockResolvedValue(false as never)

    const requestBody = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Credenciales inválidas')
  })

  it('should fail with inactive user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'administrador',
      company: 'Test Company',
      isActive: false,
      emailVerified: new Date(),
    }

    mockPrisma.user.findFirst.mockResolvedValue(mockUser as any)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Usuario inactivo')
  })

  it('should fail with unverified email', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      role: 'administrador',
      company: 'Test Company',
      isActive: true,
      emailVerified: null,
    }

    mockPrisma.user.findFirst.mockResolvedValue(mockUser as any)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Email no verificado')
  })

  it('should fail with missing email', async () => {
    const requestBody = {
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })

  it('should fail with missing password', async () => {
    const requestBody = {
      email: 'test@example.com',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })

  it('should handle database errors', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('Database error'))

    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    }

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty('error')
    expect(data.error).toContain('Error interno del servidor')
  })

  it('should fail with invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: 'invalid-json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })
})