import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock BroadcastChannel
window.BroadcastChannel = vi.fn(() => ({
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  close: vi.fn(),
}))

// Mock sessionStorage
const mockStorage = {}
window.sessionStorage = {
  getItem: vi.fn((key) => mockStorage[key] ?? null),
  setItem: vi.fn((key, value) => { mockStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockStorage[key] }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }),
}

// Mock localStorage
const mockLocalStorage = {}
window.localStorage = {
  getItem: vi.fn((key) => mockLocalStorage[key] ?? null),
  setItem: vi.fn((key, value) => { mockLocalStorage[key] = value }),
  removeItem: vi.fn((key) => { delete mockLocalStorage[key] }),
  clear: vi.fn(() => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]) }),
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  Object.keys(mockStorage).forEach(k => delete mockStorage[k])
  Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k])
})
