import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define mocks with vi.hoisted to avoid hoisting issues
const { mockGetSummerTrainingSummary, mockListClasses, mockCompleteSummerTraining } = vi.hoisted(() => ({
  mockGetSummerTrainingSummary: vi.fn(),
  mockListClasses: vi.fn(),
  mockCompleteSummerTraining: vi.fn(),
}))

// Mock SchoolYearContext first since useSchoolYearTerm depends on it
vi.mock('../../../context/SchoolYearContext', () => ({
  useSchoolYearContext: () => ({
    selectedSchoolYear: '2025',
    selectedTerm: 'hk2',
    handleYearArrow: vi.fn(),
    handleTermChange: vi.fn(),
  }),
}))

vi.mock('../../../services/pages/management/summerTraining/summerTrainingService', () => ({
  summerTrainingService: {
    getSummerTrainingSummary: mockGetSummerTrainingSummary,
    completeSummerTraining: mockCompleteSummerTraining,
    enrollConditionalStudents: vi.fn().mockResolvedValue({}),
    recordAttendance: vi.fn().mockResolvedValue({}),
    markAttendance: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../../services/pages/management/classes/classesService', () => ({
  classesService: {
    listClasses: mockListClasses,
  },
}))

vi.mock('../../../services/shared/schoolYearLookup', () => ({
  resolveSemesterId: vi.fn().mockResolvedValue(1),
}))

import SummerTrainingPage from './SummerTrainingPage.jsx'

const mockClasses = [
  { id: 1, name: '10A1', class_name: '10A1' },
  { id: 2, name: '10A2', class_name: '10A2' },
]

const mockStudents = [
  {
    enrollmentId: 101, studentId: 1001, studentCode: 'HS001',
    studentName: 'Nguyen Van A', status: 'completed',
    daysAttended: 4, days: 4, tuitionStatus: 'paid',
  },
  {
    enrollmentId: 102, studentId: 1002, studentCode: 'HS002',
    studentName: 'Tran Thi B', status: 'pending',
    daysAttended: 2, days: 4, tuitionStatus: 'paid',
  },
  {
    enrollmentId: 103, studentId: 1003, studentCode: 'HS003',
    studentName: 'Le Van C', status: 'pending',
    daysAttended: 0, days: 4, tuitionStatus: 'unpaid',
  },
]

describe('SummerTrainingPage', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    mockListClasses.mockResolvedValue(mockClasses)
    mockGetSummerTrainingSummary.mockResolvedValue({
      students: mockStudents, total: 3, totalPages: 1,
    })
    mockCompleteSummerTraining.mockResolvedValue({ success: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderPage = async (classId = '10A1') => {
    const routes = [
      {
        path: '/summer-training',
        element: <SummerTrainingPage />,
      },
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/summer-training?class=${classId}`],
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
    expect(screen.getByText('Rèn Luyện Hè')).toBeInTheDocument()
  })

  it('renders loading state when data is pending', async () => {
    mockGetSummerTrainingSummary.mockImplementation(() => new Promise(() => {}))
    mockListClasses.mockImplementation(() => new Promise(() => {}))
    await renderPage()
    expect(screen.getByText('Rèn Luyện Hè')).toBeInTheDocument()
  })

  it('renders student list when data loads', async () => {
    await renderPage()
    
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders stats cards with correct numbers', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders empty state when no students', async () => {
    // Create a fresh query client for this test to avoid cache issues
    const freshQueryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    
    mockGetSummerTrainingSummary.mockResolvedValue({
      students: [], total: 0, totalPages: 1,
    })
    
    const routes = [
      {
        path: '/summer-training',
        element: <SummerTrainingPage />,
      },
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: ['/summer-training?class=10A1'],
    })
    
    await act(async () => {
      render(
        <QueryClientProvider client={freshQueryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      )
    })
    
    await waitFor(() => {
      expect(screen.getByText('Không có học sinh cần rèn luyện hè')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('calls getSummerTrainingSummary with page and limit params', async () => {
    await renderPage()
    await waitFor(() => {
      expect(mockGetSummerTrainingSummary).toHaveBeenCalled()
    }, { timeout: 5000 })
    
    const calls = mockGetSummerTrainingSummary.mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[0]).toBe('10A1') // classId
    expect(lastCall[1]).toBe(1) // page
    expect(lastCall[2]).toBe(10) // limit
  })
})
