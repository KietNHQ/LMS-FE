import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  MANAGEMENT_TITLES,
  PERMISSION_GROUPS,
} from './permissions.js'

describe('permissions.js', () => {
  describe('PERMISSIONS constant', () => {
    it('has all expected keys', () => {
      const expectedKeys = [
        'USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
        'CLASS_VIEW', 'CLASS_MANAGE',
        'CLASS_ALLOCATION_VIEW', 'CLASS_ALLOCATION_MANAGE',
        'LESSONS_VIEW', 'LESSONS_CREATE', 'LESSONS_UPDATE', 'LESSONS_DELETE',
        'GRADE_VIEW', 'GRADE_CREATE', 'GRADE_FINALIZE', 'GRADE_UNLOCK',
        'EXAM_VIEW', 'EXAM_MANAGE', 'QUIZ_VIEW', 'QUIZ_MANAGE',
        'TIMETABLE_VIEW', 'TIMETABLE_MANAGE', 'TIMETABLE_DELETE',
        'DISCIPLINE_VIEW', 'DISCIPLINE_MANAGE',
        'VIOLATION_TYPE_VIEW', 'VIOLATION_TYPE_CREATE', 'VIOLATION_TYPE_UPDATE', 'VIOLATION_TYPE_DELETE',
        'LEAVE_REQUESTS_VIEW', 'LEAVE_REQUESTS_APPROVE', 'LEAVE_REQUESTS_MANAGE',
        'FEES_VIEW', 'FEES_CREATE', 'FEES_UPDATE', 'FEES_DELETE', 'FEES_MANAGE',
        'FINANCE_TUITION_VIEW', 'FINANCE_TUITION_MANAGE',
        'DEBT_VIEW', 'DEBT_MANAGE',
        'SCHOOL_BANK_ACCOUNT_VIEW', 'SCHOOL_BANK_ACCOUNT_MANAGE',
        'FEE_NOTICE_VIEW', 'FEE_NOTICE_MANAGE',
        'INVOICE_VIEW', 'INVOICE_MANAGE',
        'NOTIFICATION_VIEW', 'NOTIFICATION_MANAGE',
        'TEACHER_VIEW', 'TEACHER_MANAGE',
        'STUDENT_VIEW', 'STUDENT_CREATE', 'STUDENT_UPDATE', 'STUDENT_DELETE',
        'GUARDIAN_VIEW', 'GUARDIAN_CREATE', 'GUARDIAN_UPDATE', 'GUARDIAN_DELETE',
        'DEPARTMENT_VIEW', 'DEPARTMENT_MANAGE',
        'CLASS_CREATE', 'CLASS_UPDATE', 'CLASS_DELETE', 'CLASS_ASSIGN_OFFICERS', 'CLASS_READ_SUMMARY',
        'SUBJECTS_CREATE', 'SUBJECTS_UPDATE', 'SUBJECTS_DELETE',
        'ROOMS_CREATE', 'ROOMS_UPDATE', 'ROOMS_DELETE',
        'TEACHER_CREATE', 'TEACHER_UPDATE', 'TEACHER_DELETE',
        'NOTIFICATION_BROADCAST',
        'FEE_NOTICE_CREATE', 'FEE_NOTICE_UPDATE', 'FEE_NOTICE_DELETE',
        'SCHOOL_BANK_ACCOUNT_CREATE', 'SCHOOL_BANK_ACCOUNT_UPDATE', 'SCHOOL_BANK_ACCOUNT_DELETE',
        'TIMETABLE_CREATE', 'TIMETABLE_UPDATE', 'TIMETABLE_DELETE',
        'AUDIT_LOG_VIEW', 'PERMISSION_AUDIT_VIEW', 'PERMISSION_MANAGE',
        'DASHBOARD_VIEW', 'SYSTEM_CONFIG_VIEW', 'SYSTEM_CONFIG_UPDATE',
        'BACKUP_VIEW', 'BACKUP_CREATE', 'BACKUP_RESTORE', 'SYSTEM_LOG_VIEW',
        'SUBJECTS_VIEW', 'SUBJECTS_MANAGE', 'ROOMS_VIEW', 'ROOMS_MANAGE',
      ]

      expectedKeys.forEach((key) => {
        expect(PERMISSIONS).toHaveProperty(key)
        expect(typeof PERMISSIONS[key]).toBe('string')
      })
    })

    it('all permission values are non-empty strings', () => {
      Object.values(PERMISSIONS).forEach((value) => {
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    })

    it('permission values follow resource:action pattern', () => {
      Object.values(PERMISSIONS).forEach((value) => {
        expect(value).toMatch(/^[a-z_]+:[a-z_]+$/)
      })
    })
  })

  describe('MANAGEMENT_TITLES', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(MANAGEMENT_TITLES)).toBe(true)
      expect(MANAGEMENT_TITLES.length).toBeGreaterThan(0)
    })

    it('each title has label, value, and permissions array', () => {
      MANAGEMENT_TITLES.forEach((title) => {
        expect(title).toHaveProperty('label')
        expect(title).toHaveProperty('value')
        expect(title).toHaveProperty('permissions')
        expect(Array.isArray(title.permissions)).toBe(true)
        expect(typeof title.label).toBe('string')
        expect(typeof title.value).toBe('string')
      })
    })

    it('has a custom role with empty permissions', () => {
      const custom = MANAGEMENT_TITLES.find((t) => t.value === 'custom')
      expect(custom).toBeDefined()
      expect(custom.permissions).toEqual([])
    })

    it('admin and principal have all permissions', () => {
      const admin = MANAGEMENT_TITLES.find((t) => t.value === 'admin')
      const principal = MANAGEMENT_TITLES.find((t) => t.value === 'principal')

      expect(admin).toBeDefined()
      expect(principal).toBeDefined()
      expect(admin.permissions).toEqual(Object.values(PERMISSIONS))
      expect(principal.permissions).toEqual(Object.values(PERMISSIONS))
    })

    it('each role has a unique value', () => {
      const values = MANAGEMENT_TITLES.map((t) => t.value)
      const uniqueValues = new Set(values)
      expect(values.length).toBe(uniqueValues.size)
    })
  })

  describe('PERMISSION_GROUPS', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(PERMISSION_GROUPS)).toBe(true)
      expect(PERMISSION_GROUPS.length).toBeGreaterThan(0)
    })

    it('each group has id, label, and permissions array', () => {
      PERMISSION_GROUPS.forEach((group) => {
        expect(group).toHaveProperty('id')
        expect(group).toHaveProperty('label')
        expect(group).toHaveProperty('permissions')
        expect(Array.isArray(group.permissions)).toBe(true)
        expect(typeof group.id).toBe('string')
        expect(typeof group.label).toBe('string')
      })
    })

    it('groups have unique ids', () => {
      const ids = PERMISSION_GROUPS.map((g) => g.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('includes all major categories', () => {
      const groupIds = PERMISSION_GROUPS.map((g) => g.id)
      const expectedGroups = [
        'users', 'academic', 'teachers', 'students',
        'grades', 'timetable', 'discipline', 'finance',
        'notifications', 'approvals',
      ]
      expectedGroups.forEach((id) => {
        expect(groupIds).toContain(id)
      })
    })
  })
})
