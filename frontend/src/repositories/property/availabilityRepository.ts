/**
 * Availability Repository
 *
 * This repository handles database operations for availability blocks.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Tables managed:
 * - availability_blocks
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type AvailabilityBlock = Tables<'availability_blocks'>;
type AvailabilityBlockInsert = TablesInsert<'availability_blocks'>;
type AvailabilityBlockUpdate = TablesUpdate<'availability_blocks'>;

/**
 * Availability block repository class
 */
export class AvailabilityRepository {
  /**
   * Get availability blocks for a property
   */
  async getAvailabilityBlocks(
    propertyId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AvailabilityBlock[]> {
    let query = supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .order('start_date', { ascending: true });

    if (options?.startDate && options?.endDate) {
      query = query.gte('start_date', options.startDate.toISOString().split('T')[0])
                 .lte('end_date', options.endDate.toISOString().split('T')[0]);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get availability blocks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get availability block by ID
   */
  async getAvailabilityBlockById(id: string): Promise<AvailabilityBlock | null> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get availability block: ${error.message}`);
    }

    return data;
  }

  /**
   * Check availability for date range
   */
  async checkAvailability(
    propertyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    isAvailable: boolean;
    conflictingBlocks: AvailabilityBlock[];
  }> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .or(`start_date.lte.${endDateStr},end_date.gte.${startDateStr}`);

    if (error) {
      throw new Error(`Failed to check availability: ${error.message}`);
    }

    const conflictingBlocks = data || [];
    const isAvailable = conflictingBlocks.length === 0;

    return {
      isAvailable,
      conflictingBlocks,
    };
  }

  /**
   * Create a new availability block
   */
  async createAvailabilityBlock(block: AvailabilityBlockInsert): Promise<AvailabilityBlock> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .insert(block)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create availability block: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an availability block
   */
  async updateAvailabilityBlock(
    id: string,
    updates: AvailabilityBlockUpdate
  ): Promise<AvailabilityBlock> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update availability block: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an availability block (soft delete)
   */
  async deleteAvailabilityBlock(id: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('availability_blocks')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete availability block: ${error.message}`);
    }
  }

  /**
   * Get active availability blocks for a property
   */
  async getActiveAvailabilityBlocks(propertyId: string): Promise<AvailabilityBlock[]> {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get active availability blocks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get future availability blocks for a property
   */
  async getFutureAvailabilityBlocks(propertyId: string): Promise<AvailabilityBlock[]> {
    const now = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .is('deleted_at', null)
      .gt('start_date', now)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get future availability blocks: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get availability blocks by type
   */
  async getAvailabilityBlocksByType(
    propertyId: string,
    blockType: Database['public']['Enums']['availability_block_type']
  ): Promise<AvailabilityBlock[]> {
    const { data, error } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .eq('block_type', blockType)
      .is('deleted_at', null)
      .order('start_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get availability blocks by type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete all availability blocks for a property
   */
  async deletePropertyAvailabilityBlocks(propertyId: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('availability_blocks')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to delete property availability blocks: ${error.message}`);
    }
  }

  /**
   * Get availability statistics for a property
   */
  async getAvailabilityStatistics(propertyId: string): Promise<{
    totalBlocks: number;
    activeBlocks: number;
    futureBlocks: number;
    byType: Record<string, number>;
  }> {
    const allBlocks = await this.getAvailabilityBlocks(propertyId);
    const activeBlocks = await this.getActiveAvailabilityBlocks(propertyId);
    const futureBlocks = await this.getFutureAvailabilityBlocks(propertyId);

    const byType: Record<string, number> = {};
    allBlocks.forEach(block => {
      const type = block.block_type;
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      totalBlocks: allBlocks.length,
      activeBlocks: activeBlocks.length,
      futureBlocks: futureBlocks.length,
      byType,
    };
  }
}

// Export singleton instance
export const availabilityRepository = new AvailabilityRepository();
