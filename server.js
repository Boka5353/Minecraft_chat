const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // Serwuje pliki HTML/CSS z tego samego folderu

// Lista zalogowanych użytkowników online
const activeUsers = {};

// Baza kanałów i role wymagane do ich zobaczenia
const channels = [
    { id: 'weryfikacja', name: 'weryfikacja', type: 'text', roleRequired: 'GUEST' },
    { id: 'ogolny', name: 'ogólny', type: 'text', roleRequired: 'GRACZ' },
    { id: 'rekrutacja', name: 'rekrutacja-podania', type: 'text', roleRequired: 'KANDYDAT' },
    { id: 'rekrutacja_wyniki', name: 'rekrutacja-wyniki', type: 'text', roleRequired: 'ADMIN' },
    { id: 'gadu1', name: 'Gadu Gadu #1', type: 'voice', roleRequired: 'GRACZ' },
    { id: 'gadu2', name: 'Gadu Gadu #2', type: 'voice', roleRequired: 'GRACZ' }
];

io.on('connection', (socket) => {
    // 1. Logowanie użytkownika na serwerze
    socket.on('join', (data) => {
        activeUsers[socket.id] = {
            username: data.username,
            role: data.role || 'GUEST'
        };
        // Wyślij graczowi tylko te kanały, do których ma uprawnienia
        sendAllowedChannels(socket);
        // Odśwież listę osób online dla wszystkich
        io.emit('updateUserList', Object.values(activeUsers));
    });

    // 2. Obsługa wysyłania wiadomości
    socket.on('chatMessage', (data) => {
        const user = activeUsers[socket.id];
        if (!user) return;

        const channel = channels.find(c => c.id === data.channelId);
        // Zabezpieczenie: serwer sprawdza czy użytkownik na pewno ma rangę do tego kanału
        if (channel && hasPermission(user.role, channel.roleRequired)) {
            io.emit('newMessage', {
                channelId: data.channelId,
                username: user.username,
                role: user.role,
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    });

    // 3. Rozłączenie użytkownika
    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        io.emit('updateUserList', Object.values(activeUsers));
    });
});

// Hierarchia rang: GUEST (najniższa) -> KANDYDAT -> GRACZ -> ADMIN (najwyższa)
function hasPermission(userRole, requiredRole) {
    const rolesHierarchy = { 'GUEST': 1, 'KANDYDAT': 2, 'GRACZ': 3, 'ADMIN': 4 };
    return rolesHierarchy[userRole] >= rolesHierarchy[requiredRole];
}

function sendAllowedChannels(socket) {
    const user = activeUsers[socket.id];
    if (!user) return;
    const allowed = channels.filter(c => hasPermission(user.role, c.roleRequired));
    socket.emit('loadChannels', allowed);
}

// Serwer nasłuchuje na porcie 3000
http.listen(3000, () => {
    console.log('Twój Discord działa na http://localhost:3000');
});
