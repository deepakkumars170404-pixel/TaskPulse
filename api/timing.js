// Vercel Serverless Function: /api/timing
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET /api/timing
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const { data: officeTiming, error: officeError } = await supabase
          .from('office_timing')
          .select('*')
          .limit(1)
          .maybeSingle();

        const { data: eventTiming, error: eventError } = await supabase
          .from('event_timing')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (officeError || eventError) throw officeError || eventError;

        return res.status(200).json({ officeTiming, eventTiming });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({
      officeTiming: {
        open_time: '09:30 AM',
        close_time: '06:30 PM',
        working_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      },
      eventTiming: null,
    });
  }

  // POST /api/timing - Update office timing
  if (req.method === 'POST') {
    const { officeTiming, eventTiming } = req.body;

    if (supabase) {
      try {
        if (officeTiming) {
          await supabase.from('office_timing').upsert({
            id: 'primary',
            open_time: officeTiming.openTime,
            close_time: officeTiming.closeTime,
            working_days: officeTiming.workingDays,
            updated_at: new Date().toISOString(),
          });
        }

        if (eventTiming) {
          await supabase.from('event_timing').upsert({
            id: eventTiming.id,
            event_name: eventTiming.eventName,
            date: eventTiming.date,
            new_timing: eventTiming.newTiming,
            allotted_staff_ids: eventTiming.allottedStaffIds,
            is_active: eventTiming.isActive,
            updated_at: new Date().toISOString(),
          });
        }

        return res.status(200).json({ success: true });
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(200).json({ success: true, local: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
