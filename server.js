let myNick = "Użytkownik";
let myCurrentRole = "GRACZ";
let activeChannelId = "lewele";

const messagesDatabase = {};

// Układ struktur kanałów dopasowany do zrzutów z serwera
const mockChannels = [
    { id: 'lewele', name: 'lewele', type: 'text', category: 'Strefa Główna' },
    { id: 'ogloszenia_gl', name: '📢 ogłoszenia 📢', type: 'text', category: 'Strefa Główna' },
    { id: 'rekru', name: 'rekru ➕ 👑', type: 'text', category: 'Strefa Główna' },
    { id: 'max3', name: 'max 3', type: 'voice', category: 'Strefa Główna' },
    
    { id: 'ogloszenia_inf', name: 'ogłoszenia', type: 'text', category: 'INFORMACJE' },
    
    { id: 'live', name: 'LIVE', type: 'voice', category: 'LIVE-STREAM' },
    { id: 'poczekalnia', name: 'POCZEKALNIA', type: 'voice', category: 'LIVE-STREAM' },
    { id: 'gartic', name: '🔴 Gartic phone', type: 'voice', category: 'LIVE-STREAM' },
    
    { id: 'pomoc_techniczna', name: 'pomoc-techniczna', type: 'text', category: 'SUPPORT' },
    { id: 'bany_muty', name: 'bany-muty', type: 'text', category: 'SUPPORT' },
    
    { id: 'stworz_ticket', name: '📇 stwórz-ticket', type: 'text', category: 'Pomoc 13-20' },
    { id: 'pomoc1', name: '📢 Pomoc 1', type: 'voice', category: 'Pomoc 13-20' },
    { id: 'pomoc2', name: '📢 Pomoc 2', type: 'voice', category: 'Pomoc 13-20' },
    { id: 'pomoc3', name: '📢 pomoc 3', type: 'voice', category: 'Pomoc 13-20' },
    { id: 'pomoc4', name: '📢 Pomoc 4', type: 'voice', category: 'Pomoc 13-20' }
];

// TA FUNKCJA GWARANTUJE WEJŚCIE I UKRYCIE EKRANU LOGOWANIA
function checkLogin() {
    const userIn = document.getElementById('usernameInput').value.trim();
    
    if (userIn.toLowerCase() === 'boka' || userIn.toLowerCase() === 'seba') {
        myNick = userIn.toLowerCase() === 'boka' ? "Boka 👑 GG" : "Owner_Seba";
        myCurrentRole = "ADMIN";
    } else {
        myNick = userIn ? userIn : "kamil";
        myCurrentRole = "GRACZ";
    }

    // Dynamiczna zamiana widoczności elementów w DOM
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    document.getElementById('myUsername').innerText = userIn ? userIn : "Gość";
    document.getElementById('myRole').innerText = `Ranga: ${myCurrentRole}`;

    loadMockChannels();
    updateMockUsers();
    selectChannel('lewele', 'lewele');
}

function loadMockChannels() {
    const listContainer = document.getElementById('channelsList');
    if(!listContainer) return;
    listContainer.innerHTML = "";
    
    let currentCategory = "";

    mockChannels.forEach(chan => {
        if (chan.category !== currentCategory) {
            currentCategory = chan.category;
            const catDiv = document.createElement('div');
            catDiv.className = 'category';
            catDiv.innerHTML = `${currentCategory}`;
            listContainer.appendChild(catDiv);
        }

        const chanDiv = document.createElement('div');
        chanDiv.className = `channel ${chan.id === activeChannelId ? 'active' : ''}`;
        const icon = chan.type === 'text' ? 'fa-hashtag' : 'fa-volume-high';
        
        chanDiv.innerHTML = `<i class="fa-solid ${icon}"></i> ${chan.name}`;
        chanDiv.onclick = () => selectChannel(chan.id, chan.name);
        listContainer.appendChild(chanDiv);
    });
}

function selectChannel(id, name) {
    activeChannelId = id;
    document.getElementById('currentChannelName').innerHTML = `<i class="fa-solid fa-hashtag"></i> ${name}`;
    loadMockChannels();
    renderMessages();
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        if (text !== '') {
            if (!messagesDatabase[activeChannelId]) messagesDatabase[activeChannelId] = [];
            
            messagesDatabase[activeChannelId].push({
                username: myNick,
                role: myCurrentRole,
                text: text,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            input.value = '';
            renderMessages();
        }
    }
}

function renderMessages() {
    const chatMessages = document.getElementById('chatMessages');
    if(!chatMessages) return;
    chatMessages.innerHTML = "";

    if (activeChannelId === 'lewele') {
        chatMessages.innerHTML = `
            <div class="welcome-message" style="padding: 20px 0;">
                <h1 style="color: white; font-size: 32px; margin-bottom: 8px;"># Witamy na: # lewele!</h1>
                <p style="color: #949ba4;">To jest początek kanału # lewele.</p>
                <div style="border-bottom: 1px solid #3f4147; margin-top: 20px;"></div>
            </div>
        `;
    }

    const list = messagesDatabase[activeChannelId] || [];
    list.forEach(msg => {
        const roleBadge = msg.role === 'ADMIN' ? `<span class="role-badge admin-color" style="border: 1px solid #f5a623; background: rgba(245,166,35,0.1);">ADMIN</span>` : '';
        const msgHTML = `
            <div class="message">
                <div class="message-avatar"></div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="author-name ${msg.role === 'ADMIN' ? 'admin-color' : 'gracz-color'}">${msg.username}</span>
                        ${roleBadge}
                        <span class="timestamp">Dzisiaj o ${msg.timestamp}</span>
                    </div>
                    <div class="message-text">${msg.text}</div>
                </div>
            </div>`;
        chatMessages.insertAdjacentHTML('beforeend', msgHTML);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateMockUsers() {
    const list = document.getElementById('onlineMembersList');
    if(!list) return;
    list.innerHTML = `
        <div class="member-group">Właściciel — 1</div>
        <div class="member"><div class="member-avatar" style="background-color: #f5a623;"></div><span class="member-name admin-color">Boka <span class="role-badge" style="background: #f5a623; color: black;">👑 GG</span></span></div>
        
        <div class="member-group">Dostępny — 10</div>
        <div class="member"><div class="member-avatar" style="background-color: #5865f2;"></div><span class="member-name" style="color: #dbdee1;">AdviceBot <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
        <div class="member"><div class="member-avatar" style="background-color: #23a55a;"></div><span class="member-name" style="color: #dbdee1;">boht <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
        <div class="member"><div class="member-avatar" style="background-color: #49c261;"></div><span class="member-name" style="color: #dbdee1;">Dyno <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
        <div class="member"><div class="member-avatar" style="background-color: #00b0f4;"></div><span class="member-name" style="color: #dbdee1;">MEE6 <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
        <div class="member"><div class="member-avatar" style="background-color: #f23f43;"></div><span class="member-name" style="color: #dbdee1;">ProtectMe Bot <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
        <div class="member"><div class="member-avatar" style="background-color: #9b59b6;"></div><span class="member-name" style="color: #dbdee1;">Tickets <span class="role-badge" style="background: #5865f2; color:white;">✓ APL.</span></span></div>
    `;
}
