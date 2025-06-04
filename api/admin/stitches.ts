import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Supabase with service role key for admin operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Missing Supabase configuration' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all stitches with optional filtering
        const { tube_id, concept_type, is_active, limit = 100, offset = 0 } = req.query;
        
        let query = supabase
          .from('app_stitches')
          .select('*')
          .order('id');

        if (tube_id) {
          query = query.eq('tube_id', tube_id);
        }

        if (concept_type) {
          query = query.eq('concept_type', concept_type);
        }

        if (is_active !== undefined) {
          query = query.eq('is_active', is_active === 'true');
        }

        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: stitches, error: stitchesError } = await query;

        if (stitchesError) {
          console.error('Error fetching stitches:', stitchesError);
          return res.status(500).json({ error: 'Failed to fetch stitches' });
        }

        return res.status(200).json(stitches || []);

      case 'POST':
        // Create new stitch
        const { 
          id, 
          name, 
          tube_id, 
          concept_type, 
          concept_params, 
          surprise_weight = 0.05, 
          is_active = true 
        } = req.body;
        
        if (!id || !name || !tube_id || !concept_type || !concept_params) {
          return res.status(400).json({ 
            error: 'Missing required fields: id, name, tube_id, concept_type, concept_params' 
          });
        }

        const { data: newStitch, error: createError } = await supabase
          .from('app_stitches')
          .insert([{
            id,
            name,
            tube_id,
            concept_type,
            concept_params,
            surprise_weight,
            is_active
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating stitch:', createError);
          return res.status(500).json({ error: 'Failed to create stitch' });
        }

        return res.status(201).json(newStitch);

      case 'PUT':
        // Update existing stitch
        const { id: updateId } = req.query;
        if (!updateId) {
          return res.status(400).json({ error: 'Missing stitch ID' });
        }

        const updates = req.body;
        const { data: updatedStitch, error: updateError } = await supabase
          .from('app_stitches')
          .update(updates)
          .eq('id', updateId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating stitch:', updateError);
          return res.status(500).json({ error: 'Failed to update stitch' });
        }

        return res.status(200).json(updatedStitch);

      case 'DELETE':
        // Delete stitch
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Missing stitch ID' });
        }

        const { error: deleteError } = await supabase
          .from('app_stitches')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting stitch:', deleteError);
          return res.status(500).json({ error: 'Failed to delete stitch' });
        }

        return res.status(200).json({ message: 'Stitch deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin stitches API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}