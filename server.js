const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
const dataFile = path.join(__dirname, 'data.json');

// Helper per leggere e scrivere i dati
const readData = () => {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { pizzas: [], session: { active: false, currentPizzaId: null, resultsRevealed: false }, votes: [] };
    }
};

const writeData = (data) => {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Middleware per proteggere le route admin
const adminAuth = (req, res, next) => {
    const pin = req.headers['x-admin-pin'];
    if (pin === '6767') {
        next();
    } else {
        res.status(401).json({ error: 'Non autorizzato. PIN errato.' });
    }
};

// --- USER API ---

app.get('/api/session', (req, res) => {
    const data = readData();
    res.json(data.session);
});



app.post('/api/vote', (req, res) => {
    const data = readData();
    if (!data.session.active || !data.session.currentPizzaId) {
        return res.status(400).json({ error: 'La sessione di votazione non è attiva.' });
    }

    const { voterId, gusto, croccantezza, filamento, vista, costo } = req.body;
    
    if (!voterId || !gusto || !croccantezza || !filamento || !vista || !costo) {
        return res.status(400).json({ error: 'Tutti i campi sono obbligatori.' });
    }

    // Controlla se l'utente ha già votato questa pizza
    const existingVoteIndex = data.votes.findIndex(v => v.pizzaId === data.session.currentPizzaId && v.voterId === voterId);
    
    const newVote = {
        pizzaId: data.session.currentPizzaId,
        voterId,
        gusto, croccantezza, filamento, vista, costo,
        timestamp: new Date().toISOString()
    };

    if (existingVoteIndex >= 0) {
        data.votes[existingVoteIndex] = newVote; // Aggiorna il voto
    } else {
        data.votes.push(newVote);
    }

    writeData(data);
    res.json({ message: 'Voto registrato con successo!' });
});

// --- ADMIN API ---

app.post('/api/admin/auth', (req, res) => {
    const { pin } = req.body;
    if (pin === '6767') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'PIN errato' });
    }
});



app.get('/api/admin/pizzas', adminAuth, (req, res) => {
    const data = readData();
    res.json(data.pizzas);
});

app.post('/api/admin/pizzas', adminAuth, (req, res) => {
    const data = readData();
    const { name, brand, cost } = req.body;
    const newPizza = {
        id: Date.now().toString(),
        name,
        brand,
        cost: Number(cost)
    };
    data.pizzas.push(newPizza);
    writeData(data);
    res.json(newPizza);
});

app.put('/api/admin/pizzas/:id', adminAuth, (req, res) => {
    const data = readData();
    const { id } = req.params;
    const { name, brand, cost } = req.body;
    
    const index = data.pizzas.findIndex(p => p.id === id);
    if (index >= 0) {
        data.pizzas[index] = { ...data.pizzas[index], name, brand, cost: Number(cost) };
        writeData(data);
        res.json(data.pizzas[index]);
    } else {
        res.status(404).json({ error: 'Pizza non trovata' });
    }
});

app.delete('/api/admin/pizzas/:id', adminAuth, (req, res) => {
    const data = readData();
    const { id } = req.params;
    data.pizzas = data.pizzas.filter(p => p.id !== id);
    // Se la pizza eliminata era quella in sessione, disattiva la sessione
    if (data.session.currentPizzaId === id) {
        data.session.active = false;
        data.session.currentPizzaId = null;
    }
    // Rimuovi anche i voti associati (opzionale, ma pulito)
    data.votes = data.votes.filter(v => v.pizzaId !== id);
    writeData(data);
    res.json({ success: true });
});

app.post('/api/admin/session', adminAuth, (req, res) => {
    const data = readData();
    const { active, currentPizzaId } = req.body;
    
    // Se stiamo attivando una sessione (e prima non lo era o cambiamo pizza), generiamo un nuovo ID
    if (active && (!data.session.active || data.session.currentPizzaId !== currentPizzaId)) {
        data.session.sessionId = Date.now().toString();
        data.session.resultsRevealed = false;
    }
    
    data.session.active = active;
    data.session.currentPizzaId = currentPizzaId || null;
    
    writeData(data);
    res.json(data.session);
});

let sseClients = [];

app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(':ok\n\n'); // keep-alive initial
    sseClients.push(res);
    req.on('close', () => { sseClients = sseClients.filter(c => c !== res); });
});

function broadcastEvent(eventName, data) {
    sseClients.forEach(client => {
        client.write(`event: ${eventName}\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
}

app.post('/api/admin/toggle-results', adminAuth, (req, res) => {
    const data = readData();
    const { resultsRevealed } = req.body;
    data.session.resultsRevealed = resultsRevealed;
    writeData(data);
    
    // Notifica immediatamente tutti i dispositivi in ascolto
    broadcastEvent('reveal', { resultsRevealed });
    
    res.json(data.session);
});

app.get('/api/admin/leaderboard', adminAuth, (req, res) => {
    const data = readData();
    
    const scores = data.pizzas.map(pizza => {
        const pizzaVotes = data.votes.filter(v => v.pizzaId === pizza.id);
        const count = pizzaVotes.length;
        
        if (count === 0) return { ...pizza, totalScore: 0, count: 0 };
        
        const sum = pizzaVotes.reduce((acc, v) => ({
            gusto: acc.gusto + (v.gusto || (v.scores && v.scores.gusto) || 0),
            croccantezza: acc.croccantezza + (v.croccantezza || (v.scores && v.scores.croccantezza) || 0),
            filamento: acc.filamento + (v.filamento || (v.scores && v.scores.filamento) || 0),
            vista: acc.vista + (v.vista || (v.scores && v.scores.vista) || 0),
            costo: acc.costo + (v.costo || (v.scores && v.scores.costo) || 0)
        }), { gusto: 0, croccantezza: 0, filamento: 0, vista: 0, costo: 0 });
        
        const avg = {
            gusto: sum.gusto / count,
            croccantezza: sum.croccantezza / count,
            filamento: sum.filamento / count,
            vista: sum.vista / count,
            costo: sum.costo / count
        };
        
        // Il punteggio totale ora è la somma di tutti i voti anziché la media
        const totalScore = sum.gusto + sum.croccantezza + sum.filamento + sum.vista + sum.costo;
        
        return {
            ...pizza,
            avg,
            totalScore,
            count
        };
    });
    
    // Ordina per punteggio decrescente
    scores.sort((a, b) => b.totalScore - a.totalScore);
    res.json(scores);
});

app.delete('/api/admin/leaderboard', adminAuth, (req, res) => {
    const data = readData();
    data.votes = []; // Svuota tutti i voti
    data.session.resultsRevealed = false; // Nascondi i risultati
    writeData(data);
    res.json({ success: true });
});

app.get('/api/leaderboard', (req, res) => {
    const data = readData();
    if (!data.session.resultsRevealed) {
        return res.status(403).json({ error: 'Risultati non ancora disponibili' });
    }
    
    // Calcola i punteggi
    const steps = data.settings.steps;
    const scores = data.pizzas.map(pizza => {
        const pizzaVotes = data.votes.filter(v => v.pizzaId === pizza.id);
        const count = pizzaVotes.length;
        if (count === 0) return { ...pizza, totalScore: 0, count: 0 };
        
        const initialSum = {};
        steps.forEach(s => initialSum[s.id] = 0);

        const sum = pizzaVotes.reduce((acc, v) => {
            steps.forEach(s => {
                const val = (v.scores && v.scores[s.id] !== undefined) ? v.scores[s.id] : (v[s.id] || 0);
                acc[s.id] += val;
            });
            return acc;
        }, initialSum);
        
        let totalSum = 0;
        steps.forEach(s => {
            totalSum += sum[s.id]; // Somma diretta senza dividere per count
        });
        return { ...pizza, totalScore: totalSum, count };
    });
    
    scores.sort((a, b) => b.totalScore - a.totalScore);
    res.json(scores);
});

app.listen(PORT, () => {
    console.log(`Server in ascolto su http://localhost:${PORT}`);
});
