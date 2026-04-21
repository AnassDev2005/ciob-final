import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

export function useCategories(type?: "product" | "recipe") {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        let query = supabase.from("categories").select("*").order("name");
        
        if (type) {
          query = query.eq("type", type);
        }

        const { data, error } = await query;

        if (error) throw error;
        setCategories(data || []);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [type]);

  return { categories, loading, error };
}
