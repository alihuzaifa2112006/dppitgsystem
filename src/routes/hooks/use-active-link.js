import { matchPath, useLocation } from 'react-router-dom';

// ----------------------------------------------------------------------

export function useActiveLink(path, deep = true) {
  const { pathname } = useLocation();

  if (!path) return false;

  const normalActive = !!matchPath({ path, end: true }, pathname);

  if (path === '/app' || path === '/dashboard' || path === '/') {
    return normalActive;
  }

  const checkPath = path.endsWith('/') ? path : `${path}/`;
  const isDeepActive = normalActive || pathname.startsWith(checkPath);

  return isDeepActive;
}
