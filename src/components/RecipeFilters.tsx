import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { cuisineTypes, allergens } from "@/data/recipes";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { Filter, Plus, X } from "lucide-react";

interface FiltersProps {
  onApplyFilters: (filters: {
    search: string;
    cuisines: string[];
    allergens: string[];
    maxIngredients: number;
    category?: string;
    source?: string;
    sortBy?: string;
  }) => void;
}

export const RecipeFilters = ({ onApplyFilters }: FiltersProps) => {
  const [search, setSearch] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [maxIngredients, setMaxIngredients] = useState<number>(20);
  const [category, setCategory] = useState<string>("all");
  const [source, setSource] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onApplyFilters({
      search,
      cuisines: selectedCuisines,
      allergens: selectedAllergens,
      maxIngredients,
      category: category === "all" ? undefined : category,
      source: source === "all" ? undefined : source,
      sortBy,
    });
  }, [search, selectedCuisines, selectedAllergens, maxIngredients, category, source, sortBy, onApplyFilters]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm w-full mt-3 border-0"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 placeholder:text-gray-400 border-gray-200 focus:border-gray-300 dark:border-gray-700 dark:focus:border-gray-600 transition-colors h-8"
        />

        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2 h-8 px-3 ml-auto">
            <Filter className="h-3.5 w-3.5" />
            <span className="text-sm">Filters</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-3 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Select 
            value={maxIngredients.toString()} 
            onValueChange={(value) => setMaxIngredients(Number(value))}
          >
            <SelectTrigger className="flex-1 min-w-[100px] max-w-[140px] h-8 bg-white dark:bg-black text-xs pl-2 text-left truncate">
              <SelectValue placeholder="Max ingredients" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-black">
              {[5, 10, 15, 20, 25].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  Max {num} ingredients
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="flex-1 min-w-[80px] max-w-[120px] h-8 bg-white dark:bg-black text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="w-[120px] bg-white dark:bg-black">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="main">Mains</SelectItem>
              <SelectItem value="side">Sides</SelectItem>
              <SelectItem value="dessert">Sweets</SelectItem>
              <SelectItem value="appetizer">Appetizers</SelectItem>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="soup">Soups</SelectItem>
              <SelectItem value="sauce">Sauces</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={source}
            onValueChange={setSource}
          >
            <SelectTrigger className="flex-1 min-w-[80px] max-w-[120px] h-8 bg-white dark:bg-black text-xs">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent className="w-[120px] bg-white dark:bg-black">
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="curated">Recipe Sites</SelectItem>
              <SelectItem value="user">User Submitted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">Cuisine Types</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
              {cuisineTypes.map((cuisine) => (
                <div key={cuisine} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cuisine-${cuisine}`}
                    checked={selectedCuisines.includes(cuisine)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCuisines([...selectedCuisines, cuisine]);
                      } else {
                        setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
                      }
                    }}
                    className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </Checkbox>
                  <label htmlFor={`cuisine-${cuisine}`} className="text-sm truncate">{cuisine}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-gray-100 dark:border-gray-700">
            <h3 className="font-medium text-sm text-gray-600 dark:text-gray-300">Allergens</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-1.5">
              {allergens.map((allergen) => (
                <div key={allergen} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergen-${allergen}`}
                    checked={selectedAllergens.includes(allergen)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAllergens([...selectedAllergens, allergen]);
                      } else {
                        setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
                      }
                    }}
                    className="border-red-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </Checkbox>
                  <label htmlFor={`allergen-${allergen}`} className="text-sm truncate">{capitalizeFirstLetter(allergen)}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
