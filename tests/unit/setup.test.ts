import { describe, it, expect } from 'vitest'

describe('Setup Test', () => {
  it('should run basic tests', () => {
    expect(1 + 1).toBe(2)
  })
  
  it('should have correct environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
  })
})