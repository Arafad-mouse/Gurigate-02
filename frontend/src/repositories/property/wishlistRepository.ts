/**
 * Wishlist Repository
 *
 * This repository handles database operations for wishlists.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Tables managed:
 * - wishlists
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type Wishlist = Tables<'wishlists'>;
type WishlistInsert = TablesInsert<'wishlists'>;
type WishlistUpdate = TablesUpdate<'wishlists'>;

/**
 * Wishlist repository class
 */
export class WishlistRepository {
  /**
   * Get wishlists for a user
   */
  async getUserWishlists(userId: string): Promise<Wishlist[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user wishlists: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get wishlists for a property
   */
  async getPropertyWishlists(propertyId: string): Promise<Wishlist[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get property wishlists: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if user has property in wishlist
   */
  async isPropertyWishlisted(userId: string, propertyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to check wishlist: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Get wishlist by ID
   */
  async getWishlistById(id: string): Promise<Wishlist | null> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get wishlist: ${error.message}`);
    }

    return data;
  }

  /**
   * Add property to wishlist
   */
  async addToWishlist(wishlist: WishlistInsert): Promise<Wishlist> {
    const { data, error } = await supabase
      .from('wishlists')
      .insert(wishlist)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to wishlist: ${error.message}`);
    }

    return data;
  }

  /**
   * Remove property from wishlist
   */
  async removeFromWishlist(userId: string, propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
    }
  }

  /**
   * Delete wishlist by ID (soft delete)
   */
  async deleteWishlist(id: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('wishlists')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete wishlist: ${error.message}`);
    }
  }

  /**
   * Get wishlist count for a property
   */
  async getPropertyWishlistCount(propertyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to get wishlist count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get wishlist count for a user
   */
  async getUserWishlistCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('wishlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to get user wishlist count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get popular properties by wishlist count
   */
  async getPopularPropertiesByWishlist(limit: number = 10): Promise<{
    propertyId: string;
    wishlistCount: number;
  }[]> {
    const { data, error } = await supabase
      .from('wishlists')
      .select('property_id')
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to get popular properties: ${error.message}`);
    }

    const wishlist = data || [];
    const propertyCounts: Record<string, number> = {};

    wishlist.forEach(item => {
      const propertyId = item.property_id;
      propertyCounts[propertyId] = (propertyCounts[propertyId] || 0) + 1;
    });

    const sorted = Object.entries(propertyCounts)
      .map(([propertyId, wishlistCount]) => ({ propertyId, wishlistCount }))
      .sort((a, b) => b.wishlistCount - a.wishlistCount)
      .slice(0, limit);

    return sorted;
  }

  /**
   * Toggle wishlist (add if not exists, remove if exists)
   */
  async toggleWishlist(userId: string, propertyId: string): Promise<{
    added: boolean;
    wishlist: Wishlist | null;
  }> {
    const exists = await this.isPropertyWishlisted(userId, propertyId);

    if (exists) {
      await this.removeFromWishlist(userId, propertyId);
      return { added: false, wishlist: null };
    } else {
      const wishlist = await this.addToWishlist({
        user_id: userId,
        property_id: propertyId,
      });
      return { added: true, wishlist };
    }
  }
}

// Export singleton instance
export const wishlistRepository = new WishlistRepository();
