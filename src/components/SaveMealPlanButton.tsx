import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MealPlan } from "@/types/recipe";
import { Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SaveMealPlanButtonProps {
  mealPlan: MealPlan;
}

export const SaveMealPlanButton = ({ mealPlan }: SaveMealPlanButtonProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("My Weekly Meal Plan");
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSave = async () => {
    console.log('Save button clicked, user:', user);

    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting save process for user:', user.id);
      
      // Convert recipes to a serializable array and remove null values
      const recipes = Object.values(mealPlan)
        .filter(recipe => recipe !== null)
        .map(recipe => ({
          id: recipe!.id,
          title: recipe!.title,
          image: recipe!.image,
          recipeUrl: recipe!.recipeUrl,
          ingredients: recipe!.ingredients.map(ing => ({
            amount: ing.amount,
            unit: ing.unit || null,
            item: ing.item
          })),
          instructions: recipe!.instructions,
          cuisine: recipe!.cuisine,
          allergens: recipe!.allergens,
          cook_time_minutes: recipe!.cook_time_minutes || null,
          servings: recipe!.servings || null,
          rating: recipe!.rating || null,
          category: recipe!.category || null
        }));

      console.log('Prepared recipes for save:', recipes);

      const { data, error } = await supabase
        .from('saved_meal_plans')
        .insert({
          user_id: user.id,
          title: title,
          recipes: recipes as any,
          is_public: false
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Save successful:', data);
      setShowDialog(false);

      toast({
        title: "Meal plan saved!",
        description: "You can find it in your saved meal plans",
      });
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: "Error saving meal plan",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        disabled={isSaving}
        className="ml-2"
      >
        <Save className="w-4 h-4 mr-1" />
        Save
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="title">Meal Plan Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a name for your meal plan"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};