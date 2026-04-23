const CLOUD_NAME = 'ddud73mxv';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req, res) {
  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Missing Cloudinary credentials' });
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expression: 'asset_folder="campus-spots"',
        sort_by: [{ created_at: 'desc' }],
        max_results: 100,
        with_field: ['context'],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return res.status(502).json({ error: err });
  }

  const data = await response.json();

  const photos = (data.resources || []).map(r => ({
    url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto,w_1200/${r.public_id}`,
    caption: r.context?.custom?.caption || '',
  }));

  res.setHeader('Cache-Control', 'public, max-age=60');
  return res.status(200).json({ photos });
}
