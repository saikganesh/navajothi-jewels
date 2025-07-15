
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
}

const fetchCategories = async (): Promise<Category[]> => {
  console.log('Fetching categories...');
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
  
  console.log('Categories fetched:', data);
  return data || [];
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};
