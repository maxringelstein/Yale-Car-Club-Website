const CLOUD_NAME = 'ddud73mxv';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

export default async function handler(req, res) {
  const { id, caption } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const contextStr = caption ? `status=pending|caption=${caption}` : 'status=pending';

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload/${encodeURIComponent(id)}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `context=${contextStr}`,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    return res.status(502).json({ error: err });
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ ok: true });
}
