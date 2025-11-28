"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createBrowserSupabaseClient();
  const hasFetched = useRef(false);

  useEffect(() => {
    // User yoksa veya zaten fetch edildiyse çık
    if (!user) {
      if (favorites.length > 0 || loading) {
        // Sadece değişiklik gerekiyorsa state güncelle
        setFavorites([]);
        setLoading(false);
      }
      hasFetched.current = false;
      return;
    }

    // Zaten fetch edildiyse tekrar yapma
    if (hasFetched.current) return;

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("vendor_id")
          .eq("user_id", user.id);

        if (error) {
          console.error("Favorites fetch error:", error);
          setFavorites([]);
        } else {
          setFavorites(data?.map((f) => f.vendor_id) || []);
        }
      } catch (err) {
        console.error("Favorites error:", err);
        setFavorites([]);
      } finally {
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchFavorites();
  }, [favorites.length, loading, supabase, user]);

  const toggleFavorite = useCallback(
    async (vendorId: string): Promise<boolean> => {
      if (!user) return false;

      const isFavorited = favorites.includes(vendorId);

      try {
        if (isFavorited) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("vendor_id", vendorId);

          if (error) throw error;
          setFavorites((prev) => prev.filter((id) => id !== vendorId));
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert({ user_id: user.id, vendor_id: vendorId });

          if (error) throw error;
          setFavorites((prev) => [...prev, vendorId]);
        }

        return !isFavorited;
      } catch (err) {
        console.error("Toggle favorite error:", err);
        return isFavorited; // Hata durumunda mevcut durumu koru
      }
    },
    [user, favorites, supabase]
  );

  const isFavorite = useCallback(
    (vendorId: string): boolean => {
      return favorites.includes(vendorId);
    },
    [favorites]
  );

  return { favorites, loading, toggleFavorite, isFavorite };
}
