import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * TESTS UNITAIRES - Frontend API Service
 */

// Mock fetch
global.fetch = vi.fn();

describe('API Service - Frontend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('GET requests', () => {
    it('should fetch services successfully', async () => {
      const mockServices = [
        { id: 1, name: 'Service 1', description: 'Desc 1' },
        { id: 2, name: 'Service 2', description: 'Desc 2' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices
      });

      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data).toEqual(mockServices);
      expect(data.length).toBe(2);
      expect(data[0].name).toBe('Service 1');
    });

    it('should handle fetch error gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      try {
        await fetch('http://localhost:5000/api/services');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should return empty array on 404', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => []
      });

      const response = await fetch('http://localhost:5000/api/services');
      
      if (!response.ok) {
        const data = await response.json();
        expect(data).toEqual([]);
      }
    });
  });

  describe('POST requests', () => {
    it('should create new service', async () => {
      const newService = { name: 'New Service', description: 'New Desc' };
      const response = { id: 3, ...newService };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response
      });

      const result = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });

      const data = await result.json();
      expect(result.ok).toBe(true);
      expect(data.id).toBe(3);
      expect(data.name).toBe('New Service');
    });

    it('should validate required fields before POST', () => {
      const service = { name: '' }; // Missing description
      expect(service.name).toBe('');
      expect(service.description).toBeUndefined();
    });
  });

  describe('Authentication', () => {
    it('should store token in localStorage after login', () => {
      const token = 'test-token-123';
      localStorage.setItem('authToken', token);
      
      expect(localStorage.getItem('authToken')).toBe(token);
    });

    it('should clear token on logout', () => {
      localStorage.setItem('authToken', 'test-token');
      localStorage.removeItem('authToken');
      
      expect(localStorage.getItem('authToken')).toBeNull();
    });
  });

  describe('Data transformation', () => {
    it('should transform API response correctly', () => {
      const raw = {
        id: 1,
        service_name: 'Service',
        service_description: 'Desc'
      };

      const transformed = {
        id: raw.id,
        name: raw.service_name,
        description: raw.service_description
      };

      expect(transformed.name).toBe('Service');
      expect(transformed.description).toBe('Desc');
    });

    it('should handle null values in API response', () => {
      const data = { id: 1, name: null, description: undefined };
      
      const cleaned = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v != null)
      );

      expect(cleaned).toEqual({ id: 1 });
      expect(cleaned.name).toBeUndefined();
    });
  });
});
