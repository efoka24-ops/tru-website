import { useState, useEffect } from 'react';
import { backendClient } from '@/api/backendClient';

export function useSyncStatus() {
  const [syncStatus, setSyncStatus] = useState({
    backend: 'checking',
    frontend: 'checking',
    truSite: 'checking',
    lastSync: null,
    errors: []
  });

  useEffect(() => {
    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const checkSyncStatus = async () => {
    const newStatus = {
      backend: 'checking',
      frontend: 'connected', // Frontend is always connected if app is running
      truSite: 'unknown', // Not checking TRU site from backoffice
      lastSync: new Date(),
      errors: []
    };

    // Vérifier Backend principal
    try {
      await backendClient.checkHealth();
      newStatus.backend = 'connected';
    } catch (error) {
      newStatus.backend = 'offline';
      newStatus.errors.push(`Backend: ${error.message}`);
    }

    // Ne pas vérifier Frontend admin (on est dedans)
    // Ne pas vérifier Site TRU (pas nécessaire depuis backoffice)

    setSyncStatus(newStatus);
  };

  return syncStatus;
}
