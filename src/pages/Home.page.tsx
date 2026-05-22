import { Navigate } from 'react-router-dom';

export function HomePage() {
  return <Navigate to="/profile" replace />;
}
