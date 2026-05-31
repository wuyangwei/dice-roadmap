import { useSyncExternalStore } from 'react';
import { AdminPage } from './pages/AdminPage.js';
import { DisplayPage } from './pages/DisplayPage.js';
import { MobilePage } from './pages/MobilePage.js';

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_MODE?: 'display' | 'all';
  }
}

let currentPath = window.location.pathname;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot() {
  return currentPath;
}

export function navigateTo(path: string) {
  window.history.pushState({}, '', path);
  currentPath = path;
  listeners.forEach(cb => cb());
}

export function App() {
  const path = useSyncExternalStore(subscribe, getSnapshot);
  const appMode = import.meta.env.VITE_APP_MODE;
  
  if (appMode === 'display') {
    return <DisplayPage />;
  }
  
  if (appMode === 'all') {
    if (path.startsWith('/mobile')) return <MobilePage />;
    if (path.startsWith('/admin')) return <AdminPage />;
    return <MobilePage />;
  }
  
  if (path.startsWith('/mobile')) return <MobilePage />;
  if (path.startsWith('/admin')) return <AdminPage />;
  if (path.startsWith('/display')) return <DisplayPage />;
  
  return <DisplayPage />;
}
