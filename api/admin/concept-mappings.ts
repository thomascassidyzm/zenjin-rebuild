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
        // Get concept mappings with optional filtering
        const { concept_code, tube_id, is_active, limit = 100, offset = 0 } = req.query;
        
        let query = supabase
          .from('concept_tube_mappings')
          .select('*')
          .order('priority', { ascending: false })
          .order('concept_code');

        if (concept_code) {
          query = query.eq('concept_code', concept_code);
        }

        if (tube_id) {
          query = query.eq('tube_id', tube_id);
        }

        if (is_active !== undefined) {
          query = query.eq('is_active', is_active === 'true');
        }

        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: mappings, error: mappingsError } = await query;

        if (mappingsError) {
          console.error('Error fetching concept mappings:', mappingsError);
          return res.status(500).json({ error: 'Failed to fetch concept mappings' });
        }

        // Get unique concepts and their details
        const uniqueConcepts = [...new Set(mappings?.map(m => m.concept_code) || [])];
        const conceptDetails = uniqueConcepts.map(code => ({
          concept_code: code,
          tubes: mappings?.filter(m => m.concept_code === code).map(m => ({
            tube_id: m.tube_id,
            priority: m.priority,
            is_active: m.is_active,
            id: m.id
          })) || []
        }));

        return res.status(200).json({
          mappings: mappings || [],
          concepts: conceptDetails,
          total: mappings?.length || 0
        });

      case 'POST':
        // Create new concept-to-tube mapping
        const { 
          concept_code, 
          tube_id, 
          priority = 100, 
          is_active = true 
        } = req.body;
        
        if (!concept_code || !tube_id) {
          return res.status(400).json({ 
            error: 'Missing required fields: concept_code, tube_id' 
          });
        }

        // Validate tube_id
        if (!['tube1', 'tube2', 'tube3'].includes(tube_id)) {
          return res.status(400).json({ 
            error: 'Invalid tube_id. Must be tube1, tube2, or tube3' 
          });
        }

        const { data: newMapping, error: createError } = await supabase
          .from('concept_tube_mappings')
          .insert([{
            concept_code,
            tube_id,
            priority,
            is_active
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating concept mapping:', createError);
          if (createError.code === '23505') {
            return res.status(409).json({ 
              error: 'Mapping already exists for this concept and tube combination' 
            });
          }
          return res.status(500).json({ error: 'Failed to create concept mapping' });
        }

        return res.status(201).json(newMapping);

      case 'PUT':
        // Update existing mapping
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing mapping ID' });
        }

        const updates = req.body;
        
        // Validate priority if provided
        if (updates.priority !== undefined && (updates.priority < 0 || updates.priority > 1000)) {
          return res.status(400).json({ 
            error: 'Priority must be between 0 and 1000' 
          });
        }

        const { data: updatedMapping, error: updateError } = await supabase
          .from('concept_tube_mappings')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating concept mapping:', updateError);
          return res.status(500).json({ error: 'Failed to update concept mapping' });
        }

        return res.status(200).json(updatedMapping);

      case 'DELETE':
        // Delete mapping
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Missing mapping ID' });
        }

        const { error: deleteError } = await supabase
          .from('concept_tube_mappings')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting concept mapping:', deleteError);
          return res.status(500).json({ error: 'Failed to delete concept mapping' });
        }

        return res.status(200).json({ message: 'Concept mapping deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin concept mappings API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}