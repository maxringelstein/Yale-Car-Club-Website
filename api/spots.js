module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'Missing Cloudinary credentials' });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const url = `https://api.cloudinary.com/v1_1/ddud73mxv/resources/image?prefix=campus-spots%2F&type=upload&context=true&max_results=100`;
    const r = await fetch(url, { headers: { Authorization: `Basic ${auth}` } });
    if (!r.ok) throw new Error(`Cloudinary ${r.status}: ${await r.text()}`);
    const data = await r.json();
    const photos = (data.resources || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(item => ({
        url: item.secure_url,
        caption: item.context?.custom?.caption || '',
        created_at: item.created_at
      }));
    res.json({ photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
