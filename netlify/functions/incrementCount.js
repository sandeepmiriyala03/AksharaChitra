import { getStore } from '@netlify/blobs';

let localCount = 0; // In-memory fallback counter for local development/testing

export const handler = async (event) => {
  try {
    // Allow only GET and POST methods
    if (!['GET', 'POST'].includes(event.httpMethod)) {
      return {
        statusCode: 405,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method Not Allowed' }),
      };
    }

    const siteID = process.env.SITE_ID;
    const token = process.env.NETLIFY_TOKEN;

    let count;

    if (!siteID || !token) {
      // Local fallback: use in-memory count; increment if POST
      if (event.httpMethod === 'POST') {
        localCount++;
      }
      count = localCount;
    } else {
      // Production: use Netlify Blobs with siteID and token
      const store = getStore('imageCountStore', { siteID, token });
      const key = 'totalImageCount';

      count = await store.get(key, { type: 'json' }) || 0;

      if (event.httpMethod === 'POST') {
        count++;
        await store.setJSON(key, count);
      }
    }

    // Return the current count as JSON
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Internal Server Error' }),
    };
  }
};
