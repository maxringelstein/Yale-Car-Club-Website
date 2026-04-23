const CLOUD_NAME = 'ddud73mxv';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export default async function handler(req, res) {
  if (req.query.token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id, action } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const newStatus = action === 'reject' ? 'rejected' : 'approved';

  // Fetch existing context first so we preserve the caption
  const getRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload/${encodeURIComponent(id)}?context=true`,
    { headers: { 'Authorization': `Basic ${auth}` } }
  );
  let existingCaption = '';
  if (getRes.ok) {
    const info = await getRes.json();
    existingCaption = info.context?.custom?.caption || '';
  }

  const contextStr = existingCaption
    ? `status=${newStatus}|caption=${existingCaption}`
    : `status=${newStatus}`;

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
  return res.status(200).json({ ok: true, status: newStatus });
}
