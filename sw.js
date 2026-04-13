const CACHE_NAME = 'freesuite-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/og-image.svg',
  '/404.html',
  '/pages/about.html',
  '/pages/privacy.html',
  '/pages/terms.html',
  '/pages/google-docs-alternative.html',
  '/pages/notion-alternative.html',
  '/pages/smallpdf-alternative.html',
  '/pages/tools/index.html',
  '/pages/free-document-tools.html',
  '/pages/free-pdf-tools.html',
  '/pages/free-image-tools.html',
  '/pages/free-text-tools.html',
  '/pages/free-developer-tools.html',
  '/pages/free-productivity-tools.html',
  '/pages/free-utility-tools.html',
  '/pages/tools/freenotepad.html',
  '/pages/tools/freepage.html',
  '/pages/tools/freesheets.html',
  '/pages/tools/freeslides.html',
  '/pages/tools/freemergepdf.html',
  '/pages/tools/freeimagetopdf.html',
  '/pages/tools/freepdftoimage.html',
  '/pages/tools/freeimagecompressor.html',
  '/pages/tools/freecropimage.html',
  '/pages/tools/freewordcounter.html',
  '/pages/tools/freecaseconverter.html',
  '/pages/tools/freeloremipsum.html',
  '/pages/tools/freejsonformatter.html',
  '/pages/tools/freebase64.html',
  '/pages/tools/freeregextester.html',
  '/pages/tools/freediffchecker.html',
  '/pages/tools/freesqlformatter.html',
  '/pages/tools/freecodebeautify.html',
  '/pages/tools/freegradientgen.html',
  '/pages/tools/freeboxshadow.html',
  '/pages/tools/freecolorconvert.html',
  '/pages/tools/freetypingtest.html',
  '/pages/tools/freehabittracker.html',
  '/pages/tools/freepomodoro.html',
  '/pages/tools/freeemojipicker.html',
  '/pages/tools/freechatroom.html',
  '/pages/tools/freeqrcodegen.html',
  '/pages/tools/freepasswordgenerator.html',
  '/pages/tools/freeunitconvert.html',
  '/pages/tools/freememegen.html',
  '/pages/tools/freedrawboard.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('fonts.g')) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
