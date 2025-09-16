// Simple apiUrl helper used by components
// Default base is the Render backend provided by the user.
const DEFAULT_BASE = 'https://medi-trap-backend-2.onrender.com';

export function apiUrl(path = '/') {
  if (!path) path = '/';
  // ensure path starts with '/'
  if (!path.startsWith('/')) path = `/${path}`;
  // trim trailing slash in base
  const base = (process.env.API_BASE || DEFAULT_BASE).replace(/\/+$/, '');
  return `${base}${path}`;
}
