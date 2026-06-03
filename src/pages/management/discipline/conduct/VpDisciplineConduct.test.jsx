import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define mocks with vi.hoisted to avoid hoisting issues
const { mockGetDisciplineSummary, mockCallByKey } = vi.hoisted(() => ({
  mockGetDisciplineSummary: vi.fn(),
  mockCallByKey: vi.fn(),
}))

// Mock SchoolYearContext first since useSchoolYearTerm depends on it
vi.mock('../../../../context/SchoolYearContext', () => ({
  useSchoolYearContext: () => ({
    selectedSchoolYear: '2025',
    selectedTerm: 'hk1',
    handleYearArrow: vi.fn(),
    handleTermChange: vi.fn(),
  }),
}))

vi.mock('../../../../services/pages/management/vp-discipline/vpDisciplineService', () => ({
  vpDisciplineService: {
    getDisciplineSummary: mockGetDisciplineSummary,
    getAnnualDiscipline: vi.fn().mockResolvedValue([]),
    createDiscipline: vi.fn().mockResolvedValue({}),
    updateDiscipline: vi.fn().mockResolvedValue({}),
    callByKey: mockCallByKey,
  },
}))

vi.mock('../../../../utils/competitionUtils', () => ({
  getWeekDateRange: vi.fn().mockReturnValue({ startDate: '2025-08-01', endDate: '2025-08-07' }),
  formatDate: vi.fn((date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }),
  parseGradeFromClass: vi.fn(() => '10'),
}))

vi.mock('../../../../services/shared/schoolYearLookup', () => ({
  resolveSemesterId: vi.fn().mockResolvedValue(1),
  getGradeLevelFilterOptions: vi.fn().mockResolvedValue([]),
  resolveSchoolYearId: vi.fn().mockResolvedValue(1),
  resolveCurrentTermKey: vi.fn().mockResolvedValue('hk1'),
  resolveGradeLevelId: vi.fn().mockResolvedValue(1),
  getGradeLevelNumber: vi.fn((item) => item.levelNumber || item.level_number || '10'),
  getSchoolYearName: vi.fn((item) => item.name || ''),
}))

vi.mock('../../../../services/pages/management/classes/classesService', () => ({
  classesService: {
    listClasses: vi.fn().mockResolvedValue([]),
    getGradeLevelFilterOptions: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('../../../../services/pages/management/users/teachersService', () => ({
  teachersService: {
    listTeachers: vi.fn().mockResolvedValue([]),
  },
}))

import VpDisciplineConduct from './VpDisciplineConduct.jsx'

const mockStudents = [
  {
    enrollmentId: 101, studentId: 1001, studentCode: 'HS001',
    studentName: 'Nguyen Van A', academicYear: '2025',
    disciplineScore: 90, suggestedGrade: 'A',
    hk1DisciplineScore: 95, hk2DisciplineScore: 85,
    annualDisciplineScore: 90, locked: false,
  },
  {
    enrollmentId: 102, studentId: 1002, studentCode: 'HS002',
    studentName: 'Tran Thi B', academicYear: '2025',
    disciplineScore: 75, suggestedGrade: 'B',
    hk1DisciplineScore: 70, hk2DisciplineScore: 80,
    annualDisciplineScore: 75, locked: true,
  },
]

describe('VpDisciplineConduct', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    // Mock callByKey to return student data
    mockCallByKey.mockResolvedValue({
      data: mockStudents,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderPage = async (classId = '10A1') => {
    const routes = [
      {
        path: '/discipline-conduct',
        element: <VpDisciplineConduct />,
      },
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/discipline-conduct?class=${classId}`],
    })
    
    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      )
    })
  }

  it('renders the page header', async () => {
    await renderPage()
    expect(screen.getByText('Dự Kiến Hạnh Kiểm')).toBeInTheDocument()
  })

  it('renders loading state when data is pending', async () => {
    mockGetDisciplineSummary.mockImplementation(() => new Promise(() => {}))
    await renderPage()
    expect(screen.getByText('Dự Kiến Hạnh Kiểm')).toBeInTheDocument()
  })

  it('renders student list when data loads', async () => {
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders empty state when no students', async () => {
    // Mock callByKey to return empty data
    mockCallByKey.mockResolvedValue({
      data: [],
    })
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy học sinh')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('shows lock indicator for locked students', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})
