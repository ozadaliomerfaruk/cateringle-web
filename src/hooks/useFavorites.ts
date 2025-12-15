"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Supabase client'ı bir kez oluştur
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  // User ID'yi takip et
  const currentUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id ?? null;

    // User değişmediyse ve zaten fetch edildiyse çık
    if (userId === currentUserIdRef.current && !loading) {
      return;
    }

    // User yoksa state'i temizle
    if (!userId) {
      currentUserIdRef.current = null;
      setFavorites([]);
      setLoading(false);
      return;
    }

    // User değiştiyse yeni user için fetch et
    currentUserIdRef.current = userId;
    setLoading(true);

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from("favorites")
          .select("vendor_id")
          .eq("user_id", userId);

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
      }
    };

    fetchFavorites();
  }, [user?.id, supabase, loading]);

  const toggleFavorite = useCallback(
    async (vendorId: string): Promise<boolean> => {
      if (!user) return false;

      const isFavorited = favorites.includes(vendorId);

      // Optimistic update
      if (isFavorited) {
        setFavorites((prev) => prev.filter((id) => id !== vendorId));
      } else {
        setFavorites((prev) => [...prev, vendorId]);
      }

      try {
        if (isFavorited) {
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("vendor_id", vendorId);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("favorites")
            .insert({ user_id: user.id, vendor_id: vendorId });

          if (error) throw error;
        }

        return !isFavorited;
      } catch (err) {
        console.error("Toggle favorite error:", err);
        // Hata olursa geri al (rollback)
        if (isFavorited) {
          setFavorites((prev) => [...prev, vendorId]);
        } else {
          setFavorites((prev) => prev.filter((id) => id !== vendorId));
        }
        return isFavorited;
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
