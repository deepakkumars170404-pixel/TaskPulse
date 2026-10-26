// Vercel Serverless Function: /api/tasks
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET /api/tasks
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return res.status(200).json({ tasks: data });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({
      message: 'Supabase credentials not configured in environment variables. Running in local mode.',
      tasks: [],
    });
  }

  // 2. POST /api/tasks - Create task
  if (req.method === 'POST') {
    const task = req.body;
    if (!task || !task.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.from('tasks').insert([task]).select();
        if (error) throw error;
        return res.status(201).json({ task: data[0] });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(201).json({ task });
  }

  // 3. PATCH /api/tasks?id=... - Update status or issue reason
  if (req.method === 'PATCH') {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .update(updates)
          .eq('id', id)
          .select();

        if (error) throw error;
        return res.status(200).json({ task: data[0] });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, id, updates });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
