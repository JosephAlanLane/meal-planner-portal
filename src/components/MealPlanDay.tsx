import React, { useCallback, memo, useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import { Recipe, DayOfWeek } from "@/types/recipe";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface MealPlanDayProps {
  day: DayOfWeek | string;
  recipe: Recipe | null;
  onRemove: () => void;
  onDrop: (recipe: Recipe) => void;
  onDragStart: (day: DayOfWeek | string, recipe: Recipe) => void;
  onServingsChange?: (servings: number) => void;
  customServings?: number;
  className?: string;
}

const MealPlanDay = memo(({ 
  day, 
  recipe, 
  onRemove, 
  onDrop,
  onDragStart,
  onServingsChange,
  customServings,
  className = ''
}: MealPlanDayProps) => {
  // Initialize with recipe's original serving size or custom serving size if provided
  const [localServings, setLocalServings] = useState<number>(
    customServings || (recipe?.servings || 1)
  );

  // Reset local servings when recipe changes
  useEffect(() => {
    if (recipe?.servings) {
      setLocalServings(recipe.servings);
    }
  }, [recipe]);

  const [isServingsDialogOpen, setIsServingsDialogOpen] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-100', 'dark:bg-gray-600');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-600');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-100', 'dark:bg-gray-600');
    const recipeData = JSON.parse(e.dataTransfer.getData("recipe"));
    onDrop(recipeData);
  }, [onDrop]);

  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (recipe) {
      e.dataTransfer.setData("recipe", JSON.stringify(recipe));
      onDragStart(day, recipe);
      e.currentTarget.classList.add('opacity-50');
    }
  }, [recipe, day, onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  }, []);

  const handleServingsChange = (value: string) => {
    const newServings = parseInt(value);
    if (!isNaN(newServings) && newServings > 0) {
      setLocalServings(newServings);
    }
  };

  const handleUpdateServings = () => {
    console.log('Updating servings to:', localServings);
    if (onServingsChange && recipe) {
      onServingsChange(localServings);
      setIsServingsDialogOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdateServings();
    }
  };

  const handleResetServings = () => {
    if (recipe?.servings) {
      setLocalServings(recipe.servings);
      if (onServingsChange) {
        onServingsChange(recipe.servings);
      }
      setIsServingsDialogOpen(false);
    }
  };

  return (
    <>
      <div 
        className={`
          relative group
          py-1 px-2 
          bg-white dark:bg-gray-800 
          rounded-lg border border-gray-200 dark:border-gray-700
          transition-all duration-200
          hover:shadow-sm
          ${className}
          max-w-full
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center space-x-2 w-full">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {typeof day === 'string' && day.startsWith('Meal') ? day.slice(5) : day.slice(0, 2)}
              </span>
            </span>
          </div>
          
          <div className="flex-1 min-w-0 pr-16">
            {recipe ? (
              <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                className="cursor-move group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 rounded py-0.5 transition-colors duration-200 overflow-hidden"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {recipe.title}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic truncate">
                No meal planned
              </p>
            )}
          </div>

          {recipe && (
            <div className="absolute right-2 flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsServingsDialogOpen(true)}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full flex items-center gap-1"
                >
                  <Users className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {localServings}
                  </span>
                </button>
              </div>
              <button
                onClick={onRemove}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-full"
              >
                <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isServingsDialogOpen} onOpenChange={setIsServingsDialogOpen}>
        <DialogContent className="sm:max-w-[250px]">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Input
                id="servings"
                type="number"
                min="1"
                max="99"
                value={localServings}
                onChange={(e) => handleServingsChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-center"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpdateServings}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  Update
                </Button>
                <Button 
                  onClick={handleResetServings}
                  variant="outline"
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

MealPlanDay.displayName = 'MealPlanDay';

export default MealPlanDay;