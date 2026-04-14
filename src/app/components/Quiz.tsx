import { useState } from 'react';
import type { User, QuizAnswers } from '../types';
import { ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

interface QuizProps {
  user: User;
}

export function Quiz({ user }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [results, setResults] = useState<string[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

  const categories = Array.from(new Set(user.meals.map(m => m.category)));
  const cuisines = Array.from(new Set(user.meals.map(m => m.cuisine).filter(Boolean) as string[]));

  const questions = [
    {
      question: 'What type of meal are you in the mood for?',
      options: ['Any', ...categories],
      key: 'category' as keyof QuizAnswers
    },
    {
      question: 'What cuisine sounds good?',
      options: ['Any', ...cuisines],
      key: 'cuisine' as keyof QuizAnswers
    },
    {
      question: 'How much time do you have?',
      options: ['Any', 'Quick (under 15min)', 'Medium (15-30min)', 'Longer (30min+)'],
      key: 'prepTime' as keyof QuizAnswers
    }
  ];

  const handleAnswer = (value: string, key: keyof QuizAnswers) => {
    const newAnswers = {
      ...answers,
      [key]: value === 'Any' ? undefined : value
    };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      filterMeals(newAnswers);
    }
  };

  const filterMeals = (finalAnswers: QuizAnswers) => {
    let filtered = [...user.meals];

    if (finalAnswers.category) {
      filtered = filtered.filter(m => m.category === finalAnswers.category);
    }

    if (finalAnswers.cuisine) {
      filtered = filtered.filter(m => m.cuisine === finalAnswers.cuisine);
    }

    if (finalAnswers.prepTime) {
      const timeMap: { [key: string]: string[] } = {
        'Quick (under 15min)': ['5min', '10min', '15min', 'quick'],
        'Medium (15-30min)': ['20min', '25min', '30min'],
        'Longer (30min+)': ['45min', '1hr', '1.5hr', '2hr', '3hr']
      };

      const validTimes = timeMap[finalAnswers.prepTime] || [];
      filtered = filtered.filter(m =>
        m.prepTime && validTimes.some(time => m.prepTime?.toLowerCase().includes(time.toLowerCase()))
      );
    }

    setResults(filtered.map(m => m.name));
  };

  const pickRandomMeal = () => {
    if (results.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length);
      setSelectedMeal(results[randomIndex]);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
    setSelectedMeal(null);
  };

  if (user.meals.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow p-8 text-center border border-border">
        <p className="text-muted-foreground">Add some meals to your library first to use the quiz!</p>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="bg-card rounded-lg shadow p-8 border border-border">
        <h2 className="text-foreground text-center mb-6">Your Options</h2>

        {selectedMeal ? (
          <div className="text-center mb-8">
            <div className="bg-primary text-primary-foreground p-8 rounded-lg mb-6">
              <Sparkles className="mx-auto mb-4" size={48} />
              <h3 className="mb-2">You should eat:</h3>
              <p className="text-4xl font-bold">{selectedMeal}</p>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <p className="text-center text-foreground mb-4">
              Based on your preferences, here are {results.length} option{results.length !== 1 ? 's' : ''}:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
              {results.map((mealName, index) => (
                <div
                  key={index}
                  className="bg-muted border border-border rounded-lg p-3 text-center hover:bg-accent transition-colors text-foreground"
                >
                  {mealName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {!selectedMeal && (
            <button
              onClick={pickRandomMeal}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Sparkles size={20} />
              Pick One For Me!
            </button>
          )}
          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors"
          >
            <RefreshCw size={20} />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="bg-card rounded-lg shadow p-8 border border-border">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">Question {step + 1} of {questions.length}</span>
          <span className="text-sm text-muted-foreground">{Math.round(((step + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h2 className="text-foreground text-center mb-6">{currentQuestion.question}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {currentQuestion.options.map((option) => (
          <button
            key={option}
            onClick={() => handleAnswer(option, currentQuestion.key)}
            className="flex items-center justify-between p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-accent transition-colors group"
          >
            <span className="text-foreground">{option}</span>
            <ChevronRight className="text-muted-foreground group-hover:text-primary" size={20} />
          </button>
        ))}
      </div>

      {step > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setStep(step - 1)}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
