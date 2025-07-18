// Utility to get a valid JWT token from localStorage
export function getToken() {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') return null;
  return token;
}
