// Название кэша и его версия. Обновляйте версию при изменении файлов!
const CACHE_NAME = 'art-test-v1'; 

// Список всех файлов, которые должны быть кэшированы для офлайн-работы
const urlsToCache = [
  '/', // Корневая папка (index.html)
  '/index.html',
  '/style.css',
  '/script.js',
  '/questions.json', // !!! САМЫЙ ВАЖНЫЙ ФАЙЛ С ВОПРОСАМИ !!!
  
  // Здесь должны быть все ваши иконки, на которые ссылается manifest.json
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png' 
  // ... добавьте другие ресурсы, если они есть (например, шрифты)
];

// ===============================================
// 1. УСТАНОВКА (INSTALL)
// Service Worker устанавливается и кэширует все основные файлы
// ===============================================
self.addEventListener('install', event => {
  console.log('Service Worker: Установка и кэширование');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Ошибка кэширования при установке:', err);
      })
  );
});

// ===============================================
// 2. АКТИВАЦИЯ (ACTIVATE)
// Удаление старых версий кэша
// ===============================================
self.addEventListener('activate', event => {
  console.log('Service Worker: Активация и очистка старого кэша');
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Удаляем кэш, который не соответствует текущей версии
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Заставляем Service Worker немедленно взять управление над клиентами
  return self.clients.claim(); 
});

// ===============================================
// 3. ОБРАБОТКА ЗАПРОСОВ (FETCH)
// Перехват всех сетевых запросов
// ===============================================
self.addEventListener('fetch', event => {
  // Мы перехватываем запрос
  event.respondWith(
    // Сначала пытаемся найти ответ в кэше
    caches.match(event.request)
      .then(response => {
        // Если ответ найден в кэше, возвращаем его (ОФФЛАЙН!)
        if (response) {
          return response;
        }

        // Если в кэше нет, делаем обычный запрос в сеть
        return fetch(event.request)
          .then(networkResponse => {
            // Проверяем, что ответ действителен (не 404, не ошибка)
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Клонируем ответ. Один идет в браузер, другой - в кэш.
            const responseToCache = networkResponse.clone();
            
            // Если запрос GET, кэшируем его для будущих офлайн-сессий
            if (event.request.method === 'GET') {
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });
            }

            return networkResponse;
          });
      })
      .catch(error => {
        console.error('Fetch error:', error);
        // Можно вернуть офлайн-страницу, если нужно
        // return caches.match('/offline.html');
      })
  );
});
