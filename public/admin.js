let adminPin = null;

const loginPanel = document.getElementById('login-panel');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = document.getElementById('pin-input').value;
    
    try {
        const res = await fetch('/api/admin/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });
        
        if (res.ok) {
            adminPin = pin;
            loginPanel.classList.add('hidden');
            dashboard.classList.remove('hidden');
            initDashboard();
        } else {
            alert('PIN Errato');
        }
    } catch (e) {
        alert('Errore di connessione');
    }
});



// Dashboard Logic
async function fetchPizzas() {
    const res = await fetch('/api/admin/pizzas', {
        headers: { 'x-admin-pin': adminPin }
    });
    return await res.json();
}

async function renderPizzas() {
    const pizzas = await fetchPizzas();
    const list = document.getElementById('pizzas-list');
    const select = document.getElementById('pizza-select');
    
    list.innerHTML = '';
    // Salva l'opzione corrente
    const currentVal = select.value;
    select.innerHTML = '<option value="">-- Seleziona una pizza --</option>';
    
    pizzas.forEach(p => {
        // Aggiungi alla lista
        const li = document.createElement('li');
        li.className = 'pizza-item';
        li.innerHTML = `
            <span>${p.name} (Costo: €${p.cost})</span>
            <div class="pizza-actions">
                <button class="btn-icon" onclick="editPizza('${p.id}')" title="Modifica">
                    <svg class="icon-edit" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4dabf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon" onclick="deletePizza('${p.id}')" title="Elimina">
                    <svg class="icon-delete" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        list.appendChild(li);
        
        // Aggiungi alla select
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name;
        select.appendChild(opt);
    });
    
    // Ripristina la selezione se ancora valida
    if (pizzas.find(p => p.id === currentVal)) {
        select.value = currentVal;
    }
}

document.getElementById('add-pizza-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('pizza-name').value;
    const brand = document.getElementById('pizza-brand').value;
    const cost = document.getElementById('pizza-cost').value;
    
    await fetch('/api/admin/pizzas', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin
        },
        body: JSON.stringify({ name, brand, cost })
    });
    
    document.getElementById('pizza-name').value = '';
    document.getElementById('pizza-brand').value = '';
    document.getElementById('pizza-cost').value = '';
    renderPizzas();
});

window.deletePizza = async (id) => {
    if (!confirm('Sicuro di voler eliminare questa pizza?')) return;
    
    await fetch(`/api/admin/pizzas/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
    });
    
    renderPizzas();
    fetchSession(); // Update session status if the current pizza was deleted
};

window.editPizza = async (id) => {
    const pizzas = await fetchPizzas();
    const pizza = pizzas.find(p => p.id === id);
    if (!pizza) return;

    const newName = prompt('Nuovo nome:', pizza.name);
    if (!newName) return;
    const newBrand = prompt('Nuova marca:', pizza.brand || '');
    const newCost = prompt('Nuovo costo (€):', pizza.cost);
    if (!newCost) return;

    await fetch(`/api/admin/pizzas/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin
        },
        body: JSON.stringify({ name: newName, brand: newBrand, cost: newCost })
    });

    renderPizzas();
    fetchSession();
};

// Gestione Sessione
async function fetchSession() {
    const res = await fetch('/api/session');
    const session = await res.json();
    
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const status = document.getElementById('session-status');
    const select = document.getElementById('pizza-select');
    
    if (session.active) {
        btnStart.classList.add('hidden');
        btnStop.classList.remove('hidden');
        select.value = session.currentPizzaId;
        select.disabled = true;
        status.innerHTML = '🟢 Sessione <strong>ATTIVA</strong>. Gli utenti possono votare.';
    } else {
        btnStart.classList.remove('hidden');
        btnStop.classList.add('hidden');
        select.disabled = false;
        status.innerHTML = '🔴 Sessione <strong>NON ATTIVA</strong>.';
    }
    
    isResultsRevealed = session.resultsRevealed || false;
    updateToggleButton();
}

async function setSession(active) {
    const currentPizzaId = document.getElementById('pizza-select').value;
    
    if (active && !currentPizzaId) {
        alert('Seleziona una pizza prima di avviare la sessione!');
        return;
    }
    
    await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin
        },
        body: JSON.stringify({ active, currentPizzaId })
    });
    
    fetchSession();
}

document.getElementById('btn-start').addEventListener('click', () => setSession(true));
document.getElementById('btn-stop').addEventListener('click', () => setSession(false));

// Leaderboard
async function renderLeaderboard() {
    const res = await fetch('/api/admin/leaderboard', {
        headers: { 'x-admin-pin': adminPin }
    });
    const scores = await res.json();
    
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    scores.forEach((s, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${index + 1}</td>
            <td><strong>${s.name}</strong><br><small>Costo: €${s.cost}</small></td>
            <td><strong>${s.totalScore}</strong></td>
            <td>${s.count}</td>
            <td>${s.avg && s.avg.gusto ? s.avg.gusto.toFixed(1) : '-'}</td>
            <td>${s.avg && s.avg.croccantezza ? s.avg.croccantezza.toFixed(1) : '-'}</td>
            <td>${s.avg && s.avg.filamento ? s.avg.filamento.toFixed(1) : '-'}</td>
            <td>${s.avg && s.avg.vista ? s.avg.vista.toFixed(1) : '-'}</td>
            <td>${s.avg && s.avg.costo ? s.avg.costo.toFixed(1) : '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function initDashboard() {
    renderPizzas();
    fetchSession();
    renderLeaderboard();
    
    // Auto-refresh leaderboard
    setInterval(renderLeaderboard, 5000);
}

document.getElementById('btn-reset-leaderboard').addEventListener('click', async () => {
    if (confirm('🚨 ATTENZIONE 🚨\nSei sicuro di voler azzerare TUTTI i voti della classifica? L\'operazione è irreversibile.')) {
        try {
            const res = await fetch('/api/admin/leaderboard', {
                method: 'DELETE',
                headers: { 'x-admin-pin': adminPin }
            });
            
            if (res.ok) {
                renderLeaderboard();
                fetchSession();
            } else {
                alert('Errore durante il reset della classifica.');
            }
        } catch (err) {
            alert('Errore di rete.');
        }
    }
});

let isResultsRevealed = false;
document.getElementById('btn-toggle-results').addEventListener('click', async () => {
    isResultsRevealed = !isResultsRevealed;
    
    try {
        const res = await fetch('/api/admin/toggle-results', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-pin': adminPin 
            },
            body: JSON.stringify({ resultsRevealed: isResultsRevealed })
        });
        
        if (res.ok) {
            updateToggleButton();
        }
    } catch (err) {
        alert('Errore di rete.');
        isResultsRevealed = !isResultsRevealed; // revert
    }
});

function updateToggleButton() {
    const btn = document.getElementById('btn-toggle-results');
    if (isResultsRevealed) {
        btn.innerHTML = '🙈 Nascondi Risultati';
        btn.style.background = 'rgba(255, 153, 51, 0.2)';
        btn.style.borderColor = 'rgba(255, 153, 51, 0.5)';
    } else {
        btn.innerHTML = '👀 Svela Risultati';
        btn.style.background = 'rgba(51, 153, 255, 0.2)';
        btn.style.borderColor = 'rgba(51, 153, 255, 0.5)';
    }
}
