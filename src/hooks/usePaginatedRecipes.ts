import { Recipe } from '@/types/recipe';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

const RECIPES_PER_PAGE = 20;
const LOGO_URL = 'https://bopadaboopy.lovable.app/nonna-logo.png';

interface FetchRecipesParams {
  pageParam?: number;
  searchQuery?: string;
  sortBy: string;
  isAscending: boolean;
  filters?: {
    cuisines: string[];
    allergens: string[];
    maxIngredients: number;
    category?: string;
    source?: string;
  };
}

export const usePaginatedRecipes = (
  searchQuery?: string, 
  sortBy: string = 'rating', 
  isAscending: boolean = false,
  filters?: {
    cuisines: string[];
    allergens: string[];
    maxIngredients: number;
    category?: string;
    source?: string;
  }
) => {
  const fetchRecipesPage = async ({ 
    pageParam = 0, 
    searchQuery, 
    sortBy, 
    isAscending,
    filters 
  }: FetchRecipesParams) => {
    console.log('Fetching recipes page:', { pageParam, searchQuery, sortBy, isAscending, filters });
    const start = pageParam * RECIPES_PER_PAGE;
    
    let query = supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          amount,
          unit,
          item
        )
      `, { count: 'exact' });

    // Add search filter if query exists
    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    // Apply cuisine filter
    if (filters?.cuisines.length > 0) {
      query = query.in('cuisine', filters.cuisines);
    }

    // Apply allergens filter
    if (filters?.allergens.length > 0) {
      query = query.not('allergens', 'cs', `{${filters.allergens.join(',')}}`);
    }

    // Apply category filter
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Apply source filter
    if (filters?.source && filters.source !== 'all') {
      if (filters.source === 'curated') {
        query = query.eq('user_submitted', false);
      } else if (filters.source === 'user') {
        query = query.eq('user_submitted', true);
      }
    }

    // Handle sorting
    switch (sortBy) {
      case 'rating':
        query = query.order('rating', { ascending: !isAscending, nullsFirst: isAscending });
        break;
      case 'cookTime':
        query = query.order('cook_time_minutes', { ascending: isAscending, nullsFirst: !isAscending });
        break;
      case 'servings':
        query = query.order('servings', { ascending: isAscending, nullsFirst: !isAscending });
        break;
      case 'name':
        query = query.order('title', { ascending: isAscending });
        break;
      case 'popular':
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Add pagination
    const { data: recipes, error, count } = await query
      .range(start, start + RECIPES_PER_PAGE - 1);

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    console.log('Raw recipes data from Supabase:', recipes);

    // Fetch recipe usage stats
    const { data: usageStats, error: usageError } = await supabase
      .from('recipe_usage_stats')
      .select('recipe_id, used_at')
      .in('recipe_id', recipes.map(r => r.id));

    if (usageError) throw usageError;

    const usageCount = usageStats?.reduce((acc: { [key: string]: number }, stat) => {
      acc[stat.recipe_id] = (acc[stat.recipe_id] || 0) + 1;
      return acc;
    }, {});

    let recipesWithPopularity = recipes.map((recipe: any) => {
      console.log(`Processing recipe ${recipe.id} - ${recipe.title}:`, recipe.recipe_ingredients);
      
      return {
        ...recipe,
        popularity: usageCount?.[recipe.id] || 0,
        ingredients: Array.isArray(recipe.recipe_ingredients) 
          ? recipe.recipe_ingredients.map((ing: any) => ({
              amount: ing.amount,
              unit: ing.unit || '',
              item: ing.item,
            }))
          : [],
        image: recipe.image || LOGO_URL
      };
    });

    console.log('Transformed recipes with ingredients:', recipesWithPopularity);

    // Filter by max ingredients
    if (filters?.maxIngredients) {
      recipesWithPopularity = recipesWithPopularity.filter(
        recipe => recipe.ingredients.length <= filters.maxIngredients
      );
    }

    // Handle popularity sorting
    if (sortBy === 'popular') {
      recipesWithPopularity.sort((a, b) => {
        const comparison = (b.popularity || 0) - (a.popularity || 0);
        return isAscending ? -comparison : comparison;
      });
    }

    const hasMore = (start + RECIPES_PER_PAGE) < (count || 0);
    return {
      recipes: recipesWithPopularity,
      nextPage: hasMore ? pageParam + 1 : undefined,
      hasMore
    };
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['recipes', searchQuery, sortBy, isAscending, filters],
    queryFn: ({ pageParam }) => fetchRecipesPage({ 
      pageParam, 
      searchQuery, 
      sortBy, 
      isAscending,
      filters 
    }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
  });

  const recipes = data?.pages.flatMap(page => page.recipes) ?? [];

  return {
    recipes,
    isLoading,
    hasMore: hasNextPage,
    loadMore: () => {
      if (!isFetchingNextPage && hasNextPage) {
        fetchNextPage();
      }
    },
    refetch,
    isFetchingNextPage
  };
};