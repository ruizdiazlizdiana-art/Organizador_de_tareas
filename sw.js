// Instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('¡Service Worker instalado a sus órdenes!');
    self.skipWaiting(); // Obliga a que se active al toque
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activado y vigilando.');
});

// Escuchamos los pedidos que nos manda el index.html
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PROGRAMAR_TAREA') {
        const titulo = event.data.titulo;
        const delayMs = event.data.delayMs;

        console.log(`⏱️ Tarea programada: "${titulo}" para dentro de ${delayMs} ms.`);

        // El temporizador en segundo plano
        setTimeout(() => {
            const opciones = {
                body: titulo,
                icon: 'https://cdn-icons-png.flaticon.com/512/2082/2082875.png', // El rayito
                vibrate: [], // Array vacío = Cero vibración, totalmente silencioso
                silent: true, // Silencio en Android
                data: { titulo: titulo }, // Guardamos el nombre de la tarea para usarlo después
                actions: [
                    { action: 'completar', title: '✅ Completar' },
                    { action: 'posponer', title: '⏰ Posponer 15m' }
                ]
            };
            
            // Lanzamos la notificación nativa
            self.registration.showNotification('¡Aviso de Tarea!', opciones);
        }, delayMs);
    }
});

// ¿Qué pasa cuando tocás los botones de la notificación en tu celular?
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Lo primero es hacer que desaparezca la tarjetita

    const tarea = event.notification.data.titulo;

    if (event.action === 'completar') {
        console.log('Tarea completada:', tarea);
        // Acá le avisamos al index.html que la tache
        enviarMensajeAlCliente({ type: 'TAREA_COMPLETADA', titulo: tarea });
    } else if (event.action === 'posponer') {
        console.log('Tarea pospuesta:', tarea);
        // Volvemos a lanzar otra notificación en 15 min (900000 ms)
        enviarMensajeAlCliente({ type: 'TAREA_POSPUESTA', titulo: tarea });
    } else {
        // Si tocaste la notificación normal (no los botones), que te abra la app
        event.waitUntil(
            clients.openWindow('./index.html')
        );
    }
});

// Función auxiliar para hablar con tu pantalla principal
function enviarMensajeAlCliente(mensaje) {
    self.clients.matchAll().then(clientes => {
        clientes.forEach(cliente => cliente.postMessage(mensaje));
    });
}
