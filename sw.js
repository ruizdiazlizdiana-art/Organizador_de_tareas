self.addEventListener('install', (event) => {
    // Esto obliga al trabajador a instalarse sin esperar
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Esto es CLAVE: obliga al trabajador a tomar el control de la página INMEDIATAMENTE
    event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PROGRAMAR_TAREA') {
        const titulo = event.data.titulo;
        const delayMs = event.data.delayMs;

        setTimeout(() => {
            self.registration.showNotification('Pendiente:', {
                body: titulo,
                icon: 'https://cdn-icons-png.flaticon.com/512/2082/2082875.png',
                vibrate: [], // Silencioso
                silent: true, // Silencioso nativo
                data: { titulo: titulo },
                actions: [
                    { action: 'completar', title: '✅ Completar' },
                    { action: 'posponer', title: '⏰ Posponer 15m' }
                ]
            });
        }, delayMs);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const tarea = event.notification.data.titulo;

    if (event.action === 'completar') {
        enviarMensajeAlCliente({ type: 'TAREA_COMPLETADA', titulo: tarea });
    } else if (event.action === 'posponer') {
        enviarMensajeAlCliente({ type: 'TAREA_POSPUESTA', titulo: tarea });
    } else {
        event.waitUntil(clients.openWindow('./index.html'));
    }
});

function enviarMensajeAlCliente(mensaje) {
    self.clients.matchAll().then(clientes => {
        clientes.forEach(cliente => cliente.postMessage(mensaje));
    });
}
