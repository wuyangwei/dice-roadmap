import { createContext, useContext, useState, useEffect } from 'react';
import { AdminPage } from './pages/AdminPage.js';
import { DisplayPage } from './pages/DisplayPage.js';
import { MobilePage } from './pages/MobilePage.js';

declare global {
  interface ImportMetaEnv {
    readonly VITE_APP_MODE?: 'display' | 'all';
  }
}

// 创建路由上下文
interface RouterContextType {
  path: string;
  navigateTo: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigateTo: () => {},
});

// 自定义路由 hook
export function useRouter() {
  return useContext(RouterContext);
}

export function navigateTo(path: string) {
  // 这个函数会在 RouterProvider 内部重写
  // 保留这个导出是为了向后兼容
}

function RouterProvider({ children }: { children: React.ReactNode }) {
  // 初始化路径
  const [path, setPath] = useState(() => {
    const initialPath = window.location.pathname;
    // 在 APK 中，路径可能是 /index.html 或类似的，我们归一化为 /
    if (initialPath === '/index.html' || initialPath === '') {
      return '/';
    }
    return initialPath;
  });

  const navigate = (newPath: string) => {
    window.history.pushState({}, '', newPath);
    setPath(newPath);
  };

  // 监听浏览器的前进/后退按钮
  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigateTo: navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

function AppContent() {
  const { path } = useRouter();
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
