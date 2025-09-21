import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export const handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      // Fetch current count
      const { data, error } = await supabase
        .from('global_image_count')
        .select('count')
        .eq('id', 1)
        .single();

      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({ count: data.count }),
        headers: { 'Content-Type': 'application/json' },
      };

    } else if (event.httpMethod === 'POST') {
      // Increment count atomically using stored procedure
      const { error } = await supabase.rpc('increment_global_count');
      if (error) throw error;

      // Fetch updated count after increment
      const { data, error: fetchError } = await supabase
        .from('global_image_count')
        .select('count')
        .eq('id', 1)
        .single();

      if (fetchError) throw fetchError;

      return {
        statusCode: 200,
        body: JSON.stringify({ count: data.count }),
        headers: { 'Content-Type': 'application/json' },
      };
    } else {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
};
