let adminPin = null;
let currentSettings = null;
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

// --- Gestione Categorie (Steps) ---
let editingStepIndex = null;

async function fetchSettings() {
    const res = await fetch('/api/settings');
    currentSettings = await res.json();
    renderSteps();
    updateLeaderboardHeader();
}

function renderSteps() {
    const list = document.getElementById('steps-list');
    list.innerHTML = '';
    
    if (!currentSettings || !currentSettings.steps) return;
    
    currentSettings.steps.forEach((step, index) => {
        const li = document.createElement('li');
        li.className = 'pizza-item';
        li.draggable = true;
        li.dataset.index = index;
        li.innerHTML = `
            <span style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="cursor: grab; font-size: 1.2rem; color: var(--text-secondary);">☰</span>
                <span><strong>${step.emoji} ${step.name}</strong> - <small>${step.question}</small></span>
            </span>
            <div class="pizza-actions">
                <button class="btn-icon" onclick="editStep(${index})" title="Modifica">
                    <svg class="icon-edit" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4dabf7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="btn-icon" onclick="deleteStep(${index})" title="Elimina">
                    <svg class="icon-delete" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        // Drag and drop event listeners
        li.addEventListener('dragstart', (e) => {
            draggedStepIndex = index;
            e.dataTransfer.effectAllowed = 'move';
            // We use setTimeout to hide the element while dragging, creating the 'ghost' effect properly
            setTimeout(() => li.classList.add('dragging'), 0);
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            document.querySelectorAll('.pizza-item').forEach(item => item.classList.remove('drag-over'));
            draggedStepIndex = null;
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem !== li) {
                li.classList.add('drag-over');
            }
        });

        li.addEventListener('dragleave', () => {
            li.classList.remove('drag-over');
        });

        li.addEventListener('drop', async (e) => {
            e.preventDefault();
            li.classList.remove('drag-over');
            
            if (draggedStepIndex === null || draggedStepIndex === index) return;
            
            // Move item in array
            const stepToMove = currentSettings.steps.splice(draggedStepIndex, 1)[0];
            currentSettings.steps.splice(index, 0, stepToMove);
            
            // Se si stava editando lo step spostato o uno shiftato, resettiamo l'editing
            editingStepIndex = null;
            document.getElementById('submit-step-btn').textContent = 'Aggiungi Categoria';
            document.getElementById('step-name').value = '';
            document.getElementById('step-question').value = '';
            document.getElementById('step-emoji').value = '';

            await saveSettings(currentSettings);
        });

        list.appendChild(li);
    });
}

let draggedStepIndex = null;

// Rimuovo window.moveStep perché sostituito dal drag and drop




document.getElementById('add-step-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('step-name').value.trim();
    const question = document.getElementById('step-question').value.trim();
    const emoji = document.getElementById('step-emoji').value.trim();
    
    if (!currentSettings) return;
    
    if (editingStepIndex !== null) {
        // Aggiorna step esistente
        currentSettings.steps[editingStepIndex].name = name;
        currentSettings.steps[editingStepIndex].question = question;
        currentSettings.steps[editingStepIndex].emoji = emoji;
        editingStepIndex = null;
        document.getElementById('submit-step-btn').textContent = 'Aggiungi Categoria';
    } else {
        // Genera un ID formattando il nome e aggiungendo un timestamp per univocità
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now();
        currentSettings.steps.push({ id, name, question, emoji });
    }
    
    await saveSettings(currentSettings);
    
    document.getElementById('step-name').value = '';
    document.getElementById('step-question').value = '';
    document.getElementById('step-emoji').value = '';
});

window.deleteStep = async (index) => {
    if (!confirm('Sicuro di voler eliminare questa categoria? Attenzione: potresti non vedere più i voti passati per questa categoria!')) return;
    currentSettings.steps.splice(index, 1);
    
    // Reset state if we were editing the deleted step
    if (editingStepIndex === index) {
        editingStepIndex = null;
        document.getElementById('submit-step-btn').textContent = 'Aggiungi Categoria';
        document.getElementById('step-name').value = '';
        document.getElementById('step-question').value = '';
        document.getElementById('step-emoji').value = '';
    } else if (editingStepIndex !== null && editingStepIndex > index) {
        editingStepIndex--;
    }

    await saveSettings(currentSettings);
};

window.editStep = (index) => {
    editingStepIndex = index;
    const step = currentSettings.steps[index];
    document.getElementById('step-name').value = step.name;
    document.getElementById('step-question').value = step.question;
    document.getElementById('step-emoji').value = step.emoji;
    document.getElementById('submit-step-btn').textContent = 'Salva Modifiche';
};

async function saveSettings(settings) {
    await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'x-admin-pin': adminPin
        },
        body: JSON.stringify({ settings })
    });
    await fetchSettings(); // Ricarica e renderizza
}

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
function updateLeaderboardHeader() {
    const headTr = document.getElementById('leaderboard-head-tr');
    if (!headTr) return;
    
    let html = `
        <th>Pos</th>
        <th>Pizza</th>
        <th>Totale</th>
        <th>Voti</th>
    `;
    
    if (currentSettings && currentSettings.steps) {
        currentSettings.steps.forEach(step => {
            html += `<th>${step.name}</th>`;
        });
    }
    headTr.innerHTML = html;
}

async function renderLeaderboard() {
    if (!currentSettings || !currentSettings.steps) return;
    
    const res = await fetch('/api/admin/leaderboard', {
        headers: { 'x-admin-pin': adminPin }
    });
    const scores = await res.json();
    
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    
    scores.forEach((s, index) => {
        const tr = document.createElement('tr');
        
        let html = `
            <td>#${index + 1}</td>
            <td><strong>${s.name}</strong><br><small>Costo: €${s.cost}</small></td>
            <td><strong>${s.totalScore}</strong></td>
            <td>${s.count}</td>
        `;
        
        currentSettings.steps.forEach(step => {
            const val = s.avg && s.avg[step.id] ? s.avg[step.id].toFixed(1) : '-';
            html += `<td>${val}</td>`;
        });
        
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function initDashboard() {
    fetchSettings().then(() => {
        renderPizzas();
        fetchSession();
        renderLeaderboard();
        
        // Auto-refresh leaderboard
        setInterval(renderLeaderboard, 5000);
    });
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
