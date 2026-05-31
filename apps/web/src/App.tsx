import { AdminPage } from './pages/AdminPage.js';
import { DisplayPage } from './pages/DisplayPage.js';
import { MobilePage } from './pages/MobilePage.js';

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_MODE?: 'mobile' | 'display' | 'admin';
  }
}

export function App() {
  const appMode = import.meta.env.VITE_APP_MODE;
  
  if (appMode === 'mobile') {
    return <MobilePage />;
  }
  
  if (appMode === 'admin') {
    return <AdminPage />;
  }
  
  if (appMode === 'display') {
    return <DisplayPage />;
  }
  
  const path = window.location.pathname;
  if (path.startsWith('/mobile')) return <MobilePage />;
  if (path.startsWith('/admin')) return <AdminPage />;
  if (path.startsWith('/display')) return <DisplayPage />;
  
  return <DisplayPage />;
}
