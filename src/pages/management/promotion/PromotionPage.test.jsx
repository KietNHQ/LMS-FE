import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define mocks with vi.hoisted to avoid hoisting issues
const { mockGetClassPromotionSummary, mockGetLockStatus, mockListClasses, mockResolveSemesterId, mockBulkPromote } = vi.hoisted(() => ({
  mockGetClassPromotionSummary: vi.fn(),
  mockGetLockStatus: vi.fn(),
  mockListClasses: vi.fn(),
  mockResolveSemesterId: vi.fn(),
  mockBulkPromote: vi.fn(),
}))

// Mock SchoolYearContext first since useSchoolYearTerm depends on it
vi.mock('../../../context/SchoolYearContext', () => ({
  useSchoolYearContext: () => ({
    selectedSchoolYear: '2025',
    selectedTerm: 'hk1',
    handleYearArrow: vi.fn(),
    handleTermChange: vi.fn(),
  }),
}))

vi.mock('../../../services/pages/management/promotion/promotionService', () => ({
  promotionService: {
    getClassPromotionSummary: mockGetClassPromotionSummary,
    getLockStatus: mockGetLockStatus,
    bulkPromote: mockBulkPromote,
    singlePromote: vi.fn(),
    getFinanceCheck: vi.fn().mockResolvedValue({ hasUnpaidStudents: false }),
    graduateClass: vi.fn(),
    rollbackClass: vi.fn(),
  },
}))

vi.mock('../../../services/pages/management/classes/classesService', () => ({
  classesService: {
    listClasses: mockListClasses,
  },
}))

vi.mock('../../../services/shared/schoolYearLookup', () => ({
  resolveSemesterId: mockResolveSemesterId,
  resolveSchoolYearId: vi.fn((value) => value),
}))

import PromotionPage from './PromotionPage.jsx'

const mockClasses = [
  { id: 1, name: '10A1', class_name: '10A1' },
  { id: 2, name: '10A2', class_name: '10A2' },
]

const mockStudents = [
  {
    enrollmentId: 101, studentId: 1001, studentCode: 'HS001',
    studentName: 'Nguyen Van A', annualGpa: 8.5,
    hk1Conduct: 'Tot', hk2Conduct: 'Tot', annualConduct: 'Tot',
    absentDays: 2, status: 'promoted', enrollmentStatus: 'active', canPromote: true,
  },
  {
    enrollmentId: 102, studentId: 1002, studentCode: 'HS002',
    studentName: 'Tran Thi B', annualGpa: 6.2,
    hk1Conduct: 'Kha', hk2Conduct: 'Tot', annualConduct: 'Kha',
    absentDays: 5, status: 'summer_training', canPromote: false,
  },
  {
    enrollmentId: 103, studentId: 1003, studentCode: 'HS003',
    studentName: 'Le Van C', annualGpa: 4.8,
    hk1Conduct: 'Dat', hk2Conduct: 'Dat', annualConduct: 'Dat',
    absentDays: 15, status: 'retained', canPromote: false,
  },
]

describe('PromotionPage', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: 0, gcTime: 0 },
        mutations: { retry: false },
      },
    })
    mockResolveSemesterId.mockResolvedValue(1)
    mockListClasses.mockResolvedValue(mockClasses)
    mockGetLockStatus.mockResolvedValue({ canPromote: true })
    mockGetClassPromotionSummary.mockResolvedValue({
      students: mockStudents, total: 3, totalPages: 1,
    })
    mockBulkPromote.mockResolvedValue({ promoted: [101] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const renderPage = async (classId = '10A1') => {
    const routes = [
      {
        path: '/promotion',
        element: <PromotionPage />,
      },
    ]
    const router = createMemoryRouter(routes, {
      initialEntries: [`/promotion?class=${classId}`],
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
    expect(screen.getByText('Xếp Lớp & Lên Lớp')).toBeInTheDocument()
  })

  it('renders loading state when data is pending', async () => {
    mockGetClassPromotionSummary.mockImplementation(() => new Promise(() => {}))
    mockListClasses.mockImplementation(() => new Promise(() => {}))
    await renderPage()
    expect(screen.getByText('Xếp Lớp & Lên Lớp')).toBeInTheDocument()
  })

  it('renders student list when data loads', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders correct status badges', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Được lên lớp')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('renders summer training row for summer training students', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('filters student list by search term', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
    const searchInput = screen.getByPlaceholderText('Tên hoặc mã HS...')
    await act(async () => {
      await userEvent.type(searchInput, 'Tran')
    })
    await waitFor(() => {
      expect(screen.getByText('Tran Thi B')).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders empty state when no students', async () => {
    mockGetClassPromotionSummary.mockResolvedValue({
      students: [], total: 0, totalPages: 1,
    })
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy học sinh')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('disables promote button when no students selected', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Lên lớp \(0\)/ })).toBeDisabled()
    }, { timeout: 5000 })
  })

  it('calls bulkPromote when promote button is clicked', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
    const checkboxes = screen.getAllByRole('checkbox')
    await act(async () => {
      await userEvent.click(checkboxes[1])
    })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Lên lớp \(1\)/ })).toBeEnabled()
    }, { timeout: 2000 })
    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /Lên lớp \(1\)/ }))
    })
    expect(mockBulkPromote).toHaveBeenCalled()
  })

  it('calls getClassPromotionSummary with page and limit params', async () => {
    await renderPage()
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van A')).toBeInTheDocument()
    }, { timeout: 5000 })
    expect(mockGetClassPromotionSummary).toHaveBeenCalled()
    const calls = mockGetClassPromotionSummary.mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[3]).toBe(1) // page
    expect(lastCall[4]).toBe(100) // limit
  })
})
