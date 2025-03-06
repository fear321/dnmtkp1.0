// Service Worker
self.addEventListener('install', event => {
    console.log('Service Worker yüklendi');
});

self.addEventListener('activate', event => {
    console.log('Service Worker aktif edildi');
    self.clients.claim();
});

// Bildirim tıklama olayını dinle
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    // Alarmı durdur aksiyonu
    if (event.action === 'stop') {
        // Tüm istemcilere alarmı durdurma mesajı gönder
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    action: 'stopAlarm'
                });
            });
        });
        return;
    }
    
    // Bildirime tıklandığında uygulamayı aç
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Push mesajlarını dinle
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const notificationData = {
            alarmCount: 0,
            maxAlarmCount: 3,
            intervalId: null
        };

        const options = {
            body: data.body || 'Alarm zamanı!',
            icon: '../Res/alarm-icon.png',
            badge: '../Res/alarm-icon.png',
            vibrate: [200, 100, 200, 100, 200],
            tag: 'alarm-notification',
            renotify: true,
            requireInteraction: true,
            actions: [
                {
                    action: 'stop',
                    title: 'Alarmı Durdur'
                }
            ],
            data: notificationData
        };

        // Ses çalma ve bildirim gösterme işlevi
        const playAlarmAndNotify = () => {
            notificationData.alarmCount++;

            // Bildirim göster
            self.registration.showNotification(data.title || 'Alarm', options);

            // Tüm istemcilere ses çalma mesajı gönder
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        action: 'playAlarm'
                    });
                });
            });

            // 3 kez çaldıktan sonra durdur
            if (notificationData.alarmCount >= notificationData.maxAlarmCount) {
                clearInterval(notificationData.intervalId);
                
                // Tüm istemcilere alarmı durdurma mesajı gönder
                setTimeout(() => {
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                action: 'stopAlarm'
                            });
                        });
                    });
                }, 1000); // Son alarmdan 1 saniye sonra durdur
            }
        };

        // İlk alarmı hemen çal
        playAlarmAndNotify();

        // Her 10 saniyede bir tekrarla (toplamda 3 kez)
        notificationData.intervalId = setInterval(playAlarmAndNotify, 10000);

        event.waitUntil(Promise.resolve());
    }
}); 