/**
 * Property Image Repository
 *
 * This repository handles database operations for property images.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Tables managed:
 * - property_images
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type PropertyImage = Tables<'property_images'>;
type PropertyImageInsert = TablesInsert<'property_images'>;
type PropertyImageUpdate = TablesUpdate<'property_images'>;

/**
 * Property image repository class
 */
export class PropertyImageRepository {
  /**
   * Get images for a property
   */
  async getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(`Failed to get property images: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get primary image for a property
   */
  async getPrimaryImage(propertyId: string): Promise<PropertyImage | null> {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_primary', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get primary image: ${error.message}`);
    }

    return data;
  }

  /**
   * Get image by ID
   */
  async getImageById(id: string): Promise<PropertyImage | null> {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get image: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new property image
   */
  async createImage(image: PropertyImageInsert): Promise<PropertyImage> {
    const { data, error } = await supabase
      .from('property_images')
      .insert(image)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create image: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a property image
   */
  async updateImage(id: string, updates: PropertyImageUpdate): Promise<PropertyImage> {
    const { data, error } = await supabase
      .from('property_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update image: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a property image
   */
  async deleteImage(id: string): Promise<void> {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Set image as primary (unsets other primary images)
   */
  async setAsPrimary(propertyId: string, imageId: string): Promise<void> {
    // First, unset all primary images for this property
    await supabase
      .from('property_images')
      .update({ is_primary: false, sort_order: 1 })
      .eq('property_id', propertyId)
      .eq('is_primary', true);

    // Then set the new primary image
    await supabase
      .from('property_images')
      .update({ is_primary: true, sort_order: 0 })
      .eq('id', imageId);
  }

  /**
   * Update image sort order
   */
  async updateSortOrder(imageId: string, sortOrder: number): Promise<PropertyImage> {
    return this.updateImage(imageId, { sort_order: sortOrder });
  }

  /**
   * Reorder all images for a property
   */
  async reorderImages(propertyId: string, imageIds: string[]): Promise<void> {
    const updates = imageIds.map((id, index) =>
      supabase
        .from('property_images')
        .update({ sort_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }

  /**
   * Delete all images for a property
   */
  async deletePropertyImages(propertyId: string): Promise<void> {
    const { error } = await supabase
      .from('property_images')
      .delete()
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to delete property images: ${error.message}`);
    }
  }
}

// Export singleton instance
export const propertyImageRepository = new PropertyImageRepository();
