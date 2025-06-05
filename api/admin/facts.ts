import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Supabase with service role key for admin operations
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Supabase config check:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseServiceKey,
      urlPrefix: supabaseUrl?.substring(0, 20) + '...',
      keyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
    });
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
        // Get all facts with optional filtering
        const { operation_type, search, limit = 100, offset = 0 } = req.query;
        
        let query = supabase
          .from('facts')
          .select('*')
          .order('id');

        if (operation_type && operation_type !== 'all') {
          query = query.eq('operation_type', operation_type);
        }

        if (search) {
          query = query.or(`statement.ilike.%${search}%,id.ilike.%${search}%`);
        }

        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: facts, error: factsError } = await query;

        if (factsError) {
          console.error('Error fetching facts:', factsError);
          console.error('Full error details:', JSON.stringify(factsError, null, 2));
          return res.status(500).json({ 
            error: 'Failed to fetch facts', 
            details: factsError.message,
            code: factsError.code 
          });
        }

        return res.status(200).json(facts || []);

      case 'POST':
        // Create new fact
        const { statement, answer, operation_type: opType, operand1, operand2, difficulty_level, metadata } = req.body;
        
        if (!statement || !answer || !opType) {
          return res.status(400).json({ error: 'Missing required fields: statement, answer, operation_type' });
        }

        // Generate ID based on operation type and operands
        const factId = `${opType}-${operand1 || 'x'}-${operand2 || 'y'}`;

        const { data: newFact, error: createError } = await supabase
          .from('facts')
          .insert([{
            id: factId,
            statement,
            answer,
            operation_type: opType,
            operand1: operand1 || null,
            operand2: operand2 || null,
            difficulty_level: difficulty_level || 1,
            metadata: metadata || {}
          }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating fact:', createError);
          return res.status(500).json({ error: 'Failed to create fact' });
        }

        return res.status(201).json(newFact);

      case 'PUT':
        // Update existing fact
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Missing fact ID' });
        }

        const updates = req.body;
        const { data: updatedFact, error: updateError } = await supabase
          .from('facts')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating fact:', updateError);
          return res.status(500).json({ error: 'Failed to update fact' });
        }

        return res.status(200).json(updatedFact);

      case 'DELETE':
        // Delete fact
        const { id: deleteId } = req.query;
        if (!deleteId) {
          return res.status(400).json({ error: 'Missing fact ID' });
        }

        const { error: deleteError } = await supabase
          .from('facts')
          .delete()
          .eq('id', deleteId);

        if (deleteError) {
          console.error('Error deleting fact:', deleteError);
          return res.status(500).json({ error: 'Failed to delete fact' });
        }

        return res.status(200).json({ message: 'Fact deleted successfully' });

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Admin facts API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}