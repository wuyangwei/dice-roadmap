import { AdminPage } from './pages/AdminPage.js';
import { DisplayPage } from './pages/DisplayPage.js';
import { MobilePage } from './pages/MobilePage.js';

export function App() {
  const path = window.location.pathname;
  if (path.startsWith('/mobile')) return <MobilePage />;
  if (path.startsWith('/admin')) return <AdminPage />;
  return <DisplayPage />;
}
