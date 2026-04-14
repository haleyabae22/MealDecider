import { useState, useEffect } from 'react';
import type { Meal } from '../types';
import { X } from 'lucide-react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';

interface MealPackagesProps {
  onClose: () => void;
  onAddPackage: (meals: Meal[]) => void;
}

interface Package {
  _id: string;
  name: string;
  description: string;
  meals: Omit<Meal, 'id'>[];
}

export function MealPackages({ onClose, onAddPackage }: MealPackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  // Fetch packages from DB when modal opens
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      try {
        const obj = { jwtToken: retrieveToken() };
        const js = JSON.stringify(obj);
        const response = await fetch(buildPath('api/getpackages'), {
          method: 'POST',
          body: js,
          headers: { 'Content-Type': 'application/json' }
        });
        const res = JSON.parse(await response.text());
        if (res.error && res.error.length > 0) {
          setError('Failed to load packages: ' + res.error);
          return;
        }
        if (res.jwtToken) storeToken(res.jwtToken);
        setPackages(res.packages || []);
      } catch (e: any) {
        setError('Failed to load packages. Please try again.');
        console.log(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const handleAddPackage = (pkg: Package) => {
    setAdding(pkg._id);
    // Give each meal a temporary id — the real id comes back
    // from the DB after MealLibrary posts them via api/addmeals
    const meals: Meal[] = pkg.meals.map(meal => ({
      ...meal,
      id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    onAddPackage(meals);
    setAdding(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-foreground">Meal Packages</h2>
            <p className="text-sm text-muted-foreground">Add multiple meals at once to quickly build your library</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Loading packages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No packages available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div key={pkg._id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
                  <h3 className="text-foreground mb-2">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                  <p className="text-xs text-muted-foreground mb-3">{pkg.meals.length} meals included</p>
                  <button
                    onClick={() => handleAddPackage(pkg)}
                    disabled={adding === pkg._id}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {adding === pkg._id ? 'Adding...' : 'Add Package'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}