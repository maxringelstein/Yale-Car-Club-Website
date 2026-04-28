const CLOUD_NAME = 'ddud73mxv';
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// These folders are not events — skip them
const EXCLUDED = new Set(['campus-spots', 'ycar', 'campus_spots']);

function formatName(folder) {
  return folder
    .replace(/_/g, ' ')
    .replace(/\b(\w)/g, (_, c) => c.toUpperCase())
    .replace(/\bNyc\b/g, 'NYC')
    .replace(/\bAnd\b/g, '&');
}

export default async function handler(req, res) {
  if (!API_KEY || !API_SECRET) {
    return res.status(500).json({ error: 'Missing Cloudinary credentials' });
  }

  const auth    = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const baseHdr = { 'Authorization': `Basic ${auth}` };
  const jsonHdr = { ...baseHdr, 'Content-Type': 'application/json' };

  // 1. List all root-level folders
  const foldersRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/folders`,
    { headers: baseHdr }
  );
  if (!foldersRes.ok) {
    return res.status(502).json({ error: 'Failed to list Cloudinary folders' });
  }
  const { folders = [] } = await foldersRes.json();
  const eventFolders = folders
    .map(f => f.name || f.path)
    .filter(name => !EXCLUDED.has(name));

  // 2. Fetch images for each event folder in parallel
  const events = await Promise.all(eventFolders.map(async folder => {
    const searchRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
      {
        method: 'POST',
        headers: jsonHdr,
        body: JSON.stringify({
          expression: `asset_folder="${folder}"`,
          sort_by: [{ public_id: 'asc' }],
          max_results: 50,
        }),
      }
    );
    const { resources = [] } = await searchRes.json();
    const photos = resources.map(r =>
      `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto,w_1200/${r.public_id}`
    );
    // Use the earliest upload date as a proxy for the event date
    const earliestDate = resources.reduce((min, r) => {
      return r.created_at && r.created_at < min ? r.created_at : min;
    }, resources[0]?.created_at ?? '1970-01-01');
    return { folder, name: formatName(folder), photos, date: earliestDate };
  }));

  const nonEmpty = events
    .filter(e => e.photos.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date)); // newest first

  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).json({ events: nonEmpty });
}
