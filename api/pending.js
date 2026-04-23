const CLOUD_NAME = 'ddud73mxv';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.query.token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
    {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expression: 'asset_folder="campus-spots" AND context.status=pending',
        sort_by: [{ created_at: 'desc' }],
        max_results: 100,
        with_field: ['context'],
      }),
    }
  );

  const data = await response.json();
  const photos = (data.resources || []).map(r => ({
    public_id: r.public_id,
    url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto,w_800/${r.public_id}`,
    caption: r.context?.custom?.caption || '',
    created_at: r.created_at,
  }));

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ photos });
}
