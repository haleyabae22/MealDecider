import { useState } from 'react';
import type { User } from '../types';
import { MealLibrary } from './MealLibrary';
import { Quiz } from './Quiz';
import { DarkModeToggle } from './DarkModeToggle';
import { LogOut, BookOpen, HelpCircle } from 'lucide-react';
import { ScreenWrapper } from './ScreenWrapper';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export function Dashboard({ user, onLogout, onUpdateUser }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'quiz'>('library');

  return (
    <ScreenWrapper>
      <div className="min-h-screen">

        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-foreground">What Do I Want to Eat?</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.name}!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <DarkModeToggle />

              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'library'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-foreground hover:bg-accent'
              }`}
            >
              <BookOpen size={20} />
              My Meals ({user.meals.length})
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card text-foreground hover:bg-accent'
              }`}
            >
              <HelpCircle size={20} />
              What Should I Eat?
            </button>
          </div>

          {activeTab === 'library' && (
            <MealLibrary user={user} onUpdateUser={onUpdateUser} />
          )}

          {activeTab === 'quiz' && <Quiz user={user} />}
        </div>

      </div>
    </ScreenWrapper>
  );
}