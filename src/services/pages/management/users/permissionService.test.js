import { describe, it, expect, vi, beforeEach } from 'vitest'
import axiosClient from '../../../shared/http/axiosClient'

// vi.mock must be called at top level before importing the module
vi.mock('../../../shared/http/axiosClient', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { permissionService } from './permissionService.js'

const mockResponse = (data) => ({ data })

describe('permissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllPermissions', () => {
    it('calls GET /permissions and returns permission list', async () => {
      const mockPermissions = [
        { id: 1, resource: 'users', action: 'read' },
        { id: 2, resource: 'users', action: 'create' },
      ]
      axiosClient.get.mockResolvedValue(
        mockResponse({ permissions: mockPermissions, pagination: {} }),
      )

      const result = await permissionService.getAllPermissions()

      expect(axiosClient.get).toHaveBeenCalledWith('/permissions')
      expect(result).toEqual(mockPermissions)
    })

    it('returns empty array on error', async () => {
      axiosClient.get.mockRejectedValue(new Error('Network error'))

      await expect(permissionService.getAllPermissions()).rejects.toThrow('Network error')
    })

    it('handles response.data being an array directly', async () => {
      axiosClient.get.mockResolvedValue([{ id: 1 }, { id: 2 }])

      const result = await permissionService.getAllPermissions()

      expect(result).toEqual([{ id: 1 }, { id: 2 }])
    })
  })

  describe('getUserPermissions', () => {
    it('calls GET /users/:id/permissions and returns user permission list', async () => {
      const mockPermissions = [
        { id: 1, resource: 'users', action: 'read', granted: true },
        { id: 5, resource: 'grades', action: 'read', granted: true },
      ]
      axiosClient.get.mockResolvedValue(
        mockResponse({
          userId: 42,
          role: 'admin',
          permissions: mockPermissions,
          total: 2,
        }),
      )

      const result = await permissionService.getUserPermissions(42)

      expect(axiosClient.get).toHaveBeenCalledWith('/users/42/permissions')
      expect(result).toEqual(mockPermissions)
    })

    it('returns empty array on error', async () => {
      axiosClient.get.mockRejectedValue(new Error('Network error'))

      await expect(permissionService.getUserPermissions(99)).rejects.toThrow('Network error')
    })
  })

  describe('updateUserPermissions', () => {
    it('sends correct payload to PUT /users/:id/permissions', async () => {
      axiosClient.put.mockResolvedValue(mockResponse({ success: true }))

      await permissionService.updateUserPermissions(42, {
        mode: 'replace',
        permissionIds: [1, 2, 3],
      })

      expect(axiosClient.put).toHaveBeenCalledWith('/users/42/permissions', {
        mode: 'replace',
        permissionIds: [1, 2, 3],
      })
    })

    it('uses default mode when not provided', async () => {
      axiosClient.put.mockResolvedValue(mockResponse({ success: true }))

      await permissionService.updateUserPermissions(42, {
        permissionIds: [1, 2],
      })

      expect(axiosClient.put).toHaveBeenCalledWith('/users/42/permissions', {
        mode: 'replace',
        permissionIds: [1, 2],
      })
    })

    it('returns response data on success', async () => {
      const mockResult = { success: true, updatedCount: 3 }
      axiosClient.put.mockResolvedValue(mockResponse(mockResult))

      const result = await permissionService.updateUserPermissions(42, {
        permissionIds: [],
      })

      expect(result).toEqual(mockResult)
    })
  })

  describe('assignPermission', () => {
    it('calls POST /users/:id/permissions with permissionData', async () => {
      axiosClient.post.mockResolvedValue(mockResponse({ success: true }))
      const permissionData = { permissionId: 5, granted: true }

      await permissionService.assignPermission(42, permissionData)

      expect(axiosClient.post).toHaveBeenCalledWith(
        '/users/42/permissions',
        permissionData,
      )
    })
  })

  describe('revokePermission', () => {
    it('calls DELETE /users/:id/permissions/:permissionId', async () => {
      axiosClient.delete.mockResolvedValue(mockResponse({ success: true }))

      await permissionService.revokePermission(42, 5)

      expect(axiosClient.delete).toHaveBeenCalledWith('/users/42/permissions/5')
    })
  })

  describe('getRoles', () => {
    it('calls GET /roles and returns roles', async () => {
      const mockRoles = [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Teacher' },
      ]
      axiosClient.get.mockResolvedValue(mockResponse(mockRoles))

      const result = await permissionService.getRoles()

      expect(axiosClient.get).toHaveBeenCalledWith('/roles')
      expect(result).toEqual(mockRoles)
    })
  })

  describe('getPermissionAudit', () => {
    it('calls GET /audit/permissions and returns audit logs', async () => {
      const mockAudit = [
        { id: 1, action: 'grant', userId: 1, permissionId: 5, timestamp: '2025-01-01' },
      ]
      axiosClient.get.mockResolvedValue(mockResponse(mockAudit))

      const result = await permissionService.getPermissionAudit()

      expect(axiosClient.get).toHaveBeenCalledWith('/audit/permissions')
      expect(result).toEqual(mockAudit)
    })
  })
})
