const API_KEY = '8da6e3e54bde4a428782a1789c629fb4';
const HOST = 'alexisgomel.com';
const URL_LIST = [
  `https://${HOST}/`,
  `https://${HOST}/es/`,
  `https://${HOST}/sac/`,
  `https://${HOST}/es/sac/`,
  `https://${HOST}/projects/`,
  `https://${HOST}/es/projects/`,
  `https://${HOST}/cvonline/`,
  `https://${HOST}/es/cvonline/`,
  `https://${HOST}/photography/`,
  `https://${HOST}/es/photography/`,
  `https://${HOST}/playlists/`,
  `https://${HOST}/es/playlists/`,
  `https://${HOST}/contact/`,
  `https://${HOST}/es/contact/`,
  `https://${HOST}/projects/sevilla/`,
  `https://${HOST}/es/projects/sevilla/`
];

async function submitToIndexNow(endpoint) {
  console.log(`Submitting to ${endpoint}...`);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: HOST,
        key: API_KEY,
        keyLocation: `https://${HOST}/${API_KEY}.txt`,
        urlList: URL_LIST
      })
    });

    if (response.ok) {
      console.log(`Successfully submitted to ${endpoint}`);
    } else {
      console.error(`Failed to submit to ${endpoint}: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
    }
  } catch (error) {
    console.error(`Error submitting to ${endpoint}:`, error);
  }
}

const endpoints = [
  'https://www.bing.com/indexnow',
  'https://search.yandex.com/indexnow'
];

async function main() {
  for (const endpoint of endpoints) {
    await submitToIndexNow(endpoint);
  }
}

main();
