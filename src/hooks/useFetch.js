/**
 * Hook personnalisé useFetch
 * Gère la récupération de données avec caching, erreurs et loading
 */

import { useEffect, useState, useRef, useCallback } from 'react';

// Cache local pour les requêtes
const fetchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes par défaut

/**
 * Hook useFetch - Récupère les données avec cache et gestion d'erreurs
 * 
 * @param {string} url - URL à fetch
 * @param {Object} options - Options additionnelles
 * @param {number} options.cacheDuration - Durée du cache en ms (défaut: 5min)
 * @param {string} options.method - Méthode HTTP (GET, POST, etc.)
 * @param {Object} options.headers - Headers additionnels
 * @param {Object} options.body - Corps de la requête
 * @param {boolean} options.skip - Passer = true pour ignorer la requête
 * @param {string} options.key - Clé de cache personnalisée
 * @param {Function} options.onSuccess - Callback de succès
 * @param {Function} options.onError - Callback d'erreur
 * 
 * @returns {Object} { data, loading, error, refetch, isStale }
 */
export function useFetch(url, options = {}) {
  const {
    cacheDuration = CACHE_DURATION,
    method = 'GET',
    headers = {},
    body = null,
    skip = false,
    key = null,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef(null);
  const cacheKeyRef = useRef(key || url);

  /**
   * Vérifie si le cache est valide
   */
  const isCacheValid = useCallback(() => {
    const cached = fetchCache.get(cacheKeyRef.current);
    if (!cached) return false;
    
    const isExpired = Date.now() - cached.timestamp > cacheDuration;
    return !isExpired;
  }, [cacheDuration]);

  /**
   * Récupère les données
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Si on skip la requête
    if (skip && !forceRefresh) {
      setLoading(false);
      return;
    }

    // Vérifier le cache
    if (!forceRefresh && isCacheValid()) {
      const cached = fetchCache.get(cacheKeyRef.current);
      setData(cached.data);
      setLoading(false);
      setIsStale(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsStale(false);

      // Créer un AbortController pour annuler les requêtes
      abortControllerRef.current = new AbortController();

      // Préparer les headers
      const finalHeaders = {
        'Content-Type': 'application/json',
        ...headers,
      };

      // Préparer les options de fetch
      const fetchOptions = {
        method,
        headers: finalHeaders,
        signal: abortControllerRef.current.signal,
      };

      // Ajouter le body si nécessaire
      if (body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Effectuer la requête
      const response = await fetch(url, fetchOptions);

      // Vérifier le statut
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Récupérer les données
      const result = await response.json();

      // Mettre en cache
      fetchCache.set(cacheKeyRef.current, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      onSuccess?.(result);

    } catch (err) {
      // Ignorer les erreurs d'annulation
      if (err.name === 'AbortError') {
        return;
      }

      console.error(`Erreur fetch ${url}:`, err);
      setError(err.message);
      onError?.(err);

      // Utiliser le cache même expiré en cas d'erreur
      const staleCache = fetchCache.get(cacheKeyRef.current);
      if (staleCache) {
        setData(staleCache.data);
        setIsStale(true);
      }

    } finally {
      setLoading(false);
    }
  }, [url, isCacheValid, skip, headers, body, method, onSuccess, onError]);

  /**
   * Ré-exécute la requête
   */
  const refetch = useCallback((forceRefresh = true) => {
    return fetchData(forceRefresh);
  }, [fetchData]);

  /**
   * Invalide le cache
   */
  const invalidateCache = useCallback(() => {
    fetchCache.delete(cacheKeyRef.current);
  }, []);

  /**
   * Lance la requête au montage ou quand les dépendances changent
   */
  useEffect(() => {
    if (!skip) {
      fetchData();
    }

    // Cleanup: annuler la requête si le composant est démonté
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [url, skip, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache,
    isStale,
    isError: !!error,
    isLoading: loading,
  };
}

/**
 * Hook useFetchPostalCode - Fetch spécialisé avec pagination
 */
export function useFetchPaginated(baseUrl, pageSize = 10) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  const url = `${baseUrl}?page=${page}&limit=${pageSize}`;
  const { data: pageData, loading, error, refetch } = useFetch(url, {
    cacheDuration: 10 * 60 * 1000, // 10 minutes
  });

  useEffect(() => {
    if (pageData) {
      if (page === 1) {
        setData(pageData.data || pageData);
      } else {
        setData(prev => [...prev, ...(pageData.data || pageData)]);
      }
      if (pageData.totalPages) {
        setTotalPages(pageData.totalPages);
      }
    }
  }, [pageData, page]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const reset = () => {
    setPage(1);
    setData([]);
    refetch(true);
  };

  return {
    data,
    loading,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    loadMore,
    reset,
    setPage,
  };
}

/**
 * Hook useDataSync - Synchronise les données entre le frontend et le backend
 */
export function useDataSync(url, dependencies = []) {
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const syncTimeoutRef = useRef(null);
  
  const { data, loading, error, refetch } = useFetch(url, {
    cacheDuration: 2 * 60 * 1000, // 2 minutes
  });

  // Auto-refresh quand les dépendances changent
  useEffect(() => {
    if (dependencies.length > 0) {
      // Debounce le refresh
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        setSyncStatus('syncing');
        refetch(true).then(() => {
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2000);
        }).catch(() => {
          setSyncStatus('error');
        });
      }, 300);
    }

    return () => clearTimeout(syncTimeoutRef.current);
  }, dependencies);

  return {
    data,
    loading,
    error,
    syncStatus,
    refetch,
    isSynced: syncStatus === 'synced',
  };
}

export default useFetch;
