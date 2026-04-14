import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import type { User } from './types';
import { clearToken, retrieveToken } from './tokenStorage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only restore session if both user data AND a JWT token exist
    const savedUser = localStorage.getItem('user_data');
    const token = retrieveToken();
    if (savedUser && token) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    clearToken(); // clears both token_data and user_data
    setCurrentUser(null);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={currentUser}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}