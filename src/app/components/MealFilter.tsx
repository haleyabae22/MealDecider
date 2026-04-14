import { useState } from 'react';
import { Filter } from 'lucide-react';
import type { Meal } from '../types';
import { CATEGORIES, CUISINES, PREP_TIMES, FLAVOR_TAGS, TIME_OF_DAY_TAGS, COMMON_TAGS } from '../constants';

interface MealFilterProps {
  meals: Meal[];
  onFilteredMeals: (meals: Meal[]) => void;
}

export function MealFilter({ meals, onFilteredMeals }: MealFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    cuisine: '',
    prepTime: '',
    flavorTags: [] as string[],
    timeOfDayTags: [] as string[],
    tags: [] as string[]
  });

  const applyFilters = () => {
    let filtered = [...meals];

    if (filters.category) {
      filtered = filtered.filter(m => m.category === filters.category);
    }

    if (filters.cuisine) {
      filtered = filtered.filter(m => m.cuisine === filters.cuisine);
    }

    if (filters.prepTime) {
      filtered = filtered.filter(m => m.prepTime === filters.prepTime);
    }

    if (filters.flavorTags.length > 0) {
      filtered = filtered.filter(m =>
        filters.flavorTags.some(tag => m.flavorTags.includes(tag))
      );
    }

    if (filters.timeOfDayTags.length > 0) {
      filtered = filtered.filter(m =>
        filters.timeOfDayTags.some(tag => m.timeOfDayTags.includes(tag))
      );
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter(m =>
        filters.tags.some(tag => m.tags.includes(tag))
      );
    }

    onFilteredMeals(filtered);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      cuisine: '',
      prepTime: '',
      flavorTags: [],
      timeOfDayTags: [],
      tags: []
    });
    onFilteredMeals(meals);
  };

  const toggleArrayFilter = (key: 'flavorTags' | 'timeOfDayTags' | 'tags', value: string) => {
    const current = filters[key];
    if (current.includes(value)) {
      setFilters({ ...filters, [key]: current.filter(t => t !== value) });
    } else {
      setFilters({ ...filters, [key]: [...current, value] });
    }
  };

  const hasActiveFilters = filters.category || filters.cuisine || filters.prepTime ||
    filters.flavorTags.length > 0 || filters.timeOfDayTags.length > 0 || filters.tags.length > 0;

  return (
    <div className="mb-4">
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
        >
          <Filter size={18} />
          Filter Meals {hasActiveFilters && '(Active)'}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-4 bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground"
              >
                <option value="">Any</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Cuisine</label>
              <select
                value={filters.cuisine}
                onChange={(e) => setFilters({ ...filters, cuisine: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground"
              >
                <option value="">Any</option>
                {CUISINES.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Prep Time</label>
              <select
                value={filters.prepTime}
                onChange={(e) => setFilters({ ...filters, prepTime: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input-background text-foreground"
              >
                <option value="">Any</option>
                {PREP_TIMES.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">Time of Day</label>
            <div className="flex flex-wrap gap-2">
              {TIME_OF_DAY_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter('timeOfDayTags', tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.timeOfDayTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">Flavors</label>
            <div className="flex flex-wrap gap-2">
              {FLAVOR_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter('flavorTags', tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.flavorTags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-foreground mb-2">Dietary & Other Tags</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleArrayFilter('tags', tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-accent'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
}
