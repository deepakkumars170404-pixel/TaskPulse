// Vercel Serverless Function: GET /api/health
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const isSupabaseConfigured = Boolean(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  );

  return res.status(200).json({
    status: 'ok',
    service: 'TaskToggle Backend API',
    database: isSupabaseConfigured ? 'Supabase Connected' : 'Local / Demo Mode',
    timestamp: new Date().toISOString(),
  });
}
