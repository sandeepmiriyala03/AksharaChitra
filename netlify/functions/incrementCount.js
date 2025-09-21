import { getStore } from '@netlify/blobs';

export const handler = async (event) => {
  const store = getStore('imageCountStore');
  const key = 'totalImageCount';

  let count = await store.get(key, { type: 'json' }) || 0;

  if (event.httpMethod === 'POST') {
    count++;
    await store.setJSON(key, count);
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  };
};
