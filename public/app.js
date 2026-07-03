let voterId = localStorage.getItem('voterId');
if (!voterId) {
    voterId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('voterId', voterId);
}

let lastVotedSessionId = localStorage.getItem('lastVotedSessionId');
let currentSessionId = null;

const noSessionMsg = document.getElementById('no-session-msg');
const alreadyVotedMsg = document.getElementById('already-voted-msg');
const votingPanel = document.getElementById('voting-panel');
const voteForm = document.getElementById('vote-form');
const leaderboardPanel = document.getElementById('leaderboard-panel');

const pizzaFunFacts = [
    "Nel 2001, l'Agenzia Spaziale Russa ha consegnato una pizza agli astronauti della Stazione Spaziale Internazionale. È costato più di un milione di dollari!",
    "Il 'Teorema della Pizza' in geometria afferma che tagliando una pizza in otto fette in un certo modo, si può dividere in parti uguali tra due persone anche senza passare per il centro!",
    "La pizza Margherita prende il nome dalla Regina Margherita di Savoia nel 1889. Gli ingredienti furono scelti per rappresentare il tricolore della bandiera italiana!",
    "Esiste una pizza che costa 12.000 dollari! Contiene caviale, aragosta e foglia d'oro a 24 carati e viene preparata a domicilio in Italia.",
    "In Scozia, una delle varianti più popolari è la 'Pizza Crunch', ovvero una fetta di pizza immersa nella pastella e fritta per intero!",
    "Il record mondiale per la pizza più grande è stato stabilito a Roma: pesava oltre 23 tonnellate e si chiamava 'Ottavia'!",
    "In Cambogia è famosa la 'Happy Pizza', una pizza a cui viene aggiunta un'abbondante dose di marijuana come condimento...",
    "Il primo sito web in assoluto ad offrire l'ordinazione di cibo online fu PizzaNet nel 1994. Era un semplice form per ordinare pizza a Santa Cruz!",
    "La prima 'Pizzeria' ufficiale del mondo nacque a Napoli nel 1830: l'Antica Pizzeria Port'Alba. Prima le pizze venivano vendute in strada.",
    "La più grande consegna di pizza della storia fu fatta dall'esercito americano: 3000 pizze trasportate in elicottero per i soldati in Iraq!",
    "Negli Stati Uniti, il mese di ottobre è ufficialmente il 'National Pizza Month'. Fu dichiarato tale nel 1984.",
    "L'uomo che detiene il record per aver mangiato più pizza al mondo ne ha consumata una intera in soli 23,62 secondi!",
    "In Giappone esiste una variante della pizza condita con maionese, patate e talvolta persino calamari e polpo!",
    "Nel 2013, si è scoperto che i cani amano la pizza così tanto che un'azienda ha creato una 'mini-pizza' appositamente formulata per i cuccioli.",
    "Il campione del mondo di mangiatori competitivi Joey Chestnut ha mangiato 45 fette di pizza (oltre 5 pizze intere) in 10 minuti.",
    "La 'Pizza hawaiana' con l'ananas non è nata alle Hawaii, ma è stata inventata nel 1962 da un ristoratore greco in Canada!",
    "In Brasile, è normale mettere i piselli, il mais o persino il purè di patate come condimento sulla pizza.",
    "In Svezia la pizza 'Africana' è un grande classico: ha sopra banane, arachidi, curry, ananas e pollo!",
    "Uno dei furti più curiosi della storia avvenne quando un ladro rubò un'auto per le consegne, fece le consegne ai clienti, intascò i soldi e fuggì.",
    "Un uomo in Russia ha amato così tanto la pizza che nel 2015 ha organizzato un matrimonio legale... sposando una pizza intera in una cerimonia a Tomsk!",
    "Una singola fetta della pizza più lunga del mondo misurava quasi 2 chilometri! Fu preparata a Napoli nel 2016 da 250 pizzaioli.",
    "La parola 'Pizza' è documentata per la prima volta nell'anno 997 d.C. in un testo latino ritrovato nella città di Gaeta.",
    "Nel 2017 un software di Intelligenza Artificiale, ispirandosi a milioni di ricette, ha inventato da solo una pizza con menta e pesche.",
    "Esiste una 'Dieta della Pizza': un uomo l'ha mangiata tutti i giorni per un anno intero ed è persino dimagrito, controllando l'apporto calorico!",
    "Il formaggio mozzarella usato oggi fu introdotto in Italia solo grazie ai bufali d'acqua portati probabilmente dall'Asia in epoca medievale.",
    "Il profumo della pizza calda fa rilasciare al cervello dopamina, rendendoti fisicamente più felice prima ancora di darle il primo morso.",
    "In Corea del Sud, le croste della pizza sono spesso ripiene non di formaggio, ma di crema pasticcera o patate dolci, e vengono mangiate con il miele.",
    "Si calcola che in tutto il mondo vengano mangiate circa 5 miliardi di pizze ogni anno, escludendo le pizze fatte in casa!",
    "Nel 2010 un informatico pagò 10.000 Bitcoin per farsi consegnare due pizze. Oggi quei Bitcoin varrebbero centinaia di milioni di dollari!",
    "In Finlandia, esiste la pizza 'Berlusconi', condita con carne di renna affumicata! Fu creata dopo che il politico italiano criticò il cibo finlandese."
];

function updateFunFact() {
    const randomFact = pizzaFunFacts[Math.floor(Math.random() * pizzaFunFacts.length)];
    document.querySelectorAll('.fun-fact-text').forEach(el => {
        el.textContent = randomFact;
    });
}

// Inizializza un fun fact alla partenza per sicurezza
updateFunFact();

// Cambia automaticamente il fun fact ogni 30 secondi
setInterval(updateFunFact, 30000);

function switchPanel(panelToShow, skipAnimation = false) {
    if (document.querySelector('.step-actions')) {
        const vespaTransition = document.getElementById('vespa-transition');
        
        // Se il pannello è già visibile, non fare nulla
        if (!panelToShow.classList.contains('hidden')) return;
        
        // Se non abbiamo ancora caricato l'HTML della Vespa o vogliamo skippare, usa il fallback
        if (!vespaTransition || skipAnimation) {
            eseguiSwitch();
            return;
        }

        // Anima la Vespa in ingresso
        vespaTransition.classList.remove('hidden');
        void vespaTransition.offsetWidth; // trigger reflow
        vespaTransition.classList.add('active');
        
        setTimeout(() => {
            // Quando la Vespa è uscita dallo schermo ma la scia copre ancora tutto (circa 1.75s)
            eseguiSwitch();
            
            setTimeout(() => {
                // Rimuovi la classe active a fine animazione (1.0s totali)
                vespaTransition.classList.remove('active');
                vespaTransition.classList.add('hidden');
            }, 300); // restante tempo per completare 1.0s
            
        }, 700); // tempo in cui la scia copre tutto e la Vespa è passata
    }

    function eseguiSwitch() {
        updateFunFact(); // Cambia il fun fact ogni volta che mostri un nuovo pannello
        [noSessionMsg, votingPanel, alreadyVotedMsg, leaderboardPanel].forEach(p => {
            if (p === panelToShow) {
                p.classList.remove('hidden');
                p.classList.remove('animate-pop');
                void p.offsetWidth;
                p.classList.add('animate-pop');
            } else {
                p.classList.add('hidden');
            }
        });
    }
}

const votes = {
    taste: 0,
    crunchiness: 0,
    cheesePull: 0,
    appearance: 0,
    cost: 0
};

const totalSteps = 6;
let currentStep = 1;

// Configura interazione fette di pizza alla partenza
attachStarListeners();
window.goToStep = function(stepNumber) {
    // Gestisce le classi CSS per le animazioni
    document.querySelectorAll('.step').forEach(step => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum < stepNumber) {
            step.className = 'step exit';
        } else if (stepNum > stepNumber) {
            step.className = 'step'; // Rimane pronto ad entrare da destra
        }
    });
    
    // Mostra lo step corrente in modo spettacolare
    const activeStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
    if (activeStep) activeStep.className = 'step active';
    
    // Avanzamento barra di progresso
    const progress = document.getElementById('progress-bar');
    progress.style.width = `${(stepNumber / totalSteps) * 100}%`;
    
    // Se siamo alla fine (panoramica), compiliamo il riepilogo
    if (stepNumber === totalSteps) {
        Object.keys(votes).forEach(field => {
            const valSpan = document.getElementById(`sum-val-${field}`);
            const sumPie = document.getElementById(`sum-pie-${field}`);
            if (valSpan) valSpan.textContent = `${votes[field]}/5`;
            if (sumPie) {
                const dashValue = (votes[field] / 5) * 157.1;
                sumPie.style.strokeDasharray = `${dashValue} 158`;
            }
        });
    }
    
    currentStep = stepNumber;
};

window.goBack = function() {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
};

window.goNext = function() {
    const activeStepDiv = document.querySelector('.step.active');
    if (activeStepDiv) {
        const ratingDiv = activeStepDiv.querySelector('.star-rating');
        if (ratingDiv) {
            const field = ratingDiv.dataset.field;
            if (votes[field] === 0) {
                showToast('Devi prima scegliere quanti spicchi dare! 🍕');
                return;
            }
        }
    }
    goToStep(currentStep + 1);
};

// Configura interazione fette di pizza (stelle)
function attachStarListeners() {
    document.querySelectorAll('.star-rating').forEach(ratingDiv => {
        const field = ratingDiv.dataset.field;
        const stars = ratingDiv.querySelectorAll('.star');

        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = parseInt(star.dataset.value);
                votes[field] = value;
                updateStars(ratingDiv, value);
                
                // Animazione formazione pizza (SVG Pie Chart)
                const pieChart = document.getElementById(`pie-${field}`);
                if (pieChart) {
                    const dashValue = (value / 5) * 157.1;
                    pieChart.style.strokeDasharray = `${dashValue} 158`;
                }
                
                // Animazione pop spettacolare della fetta cliccata
                star.classList.add('pop');
                
                // Abilita il pulsante avanti per questo step
                const activeStepDiv = star.closest('.step');
                if (activeStepDiv) {
                    const forwardBtn = activeStepDiv.querySelector('.btn-forward');
                    if (forwardBtn) forwardBtn.classList.remove('disabled');
                }
                
                // Aspetta un istante per far terminare l'animazione di pop
                setTimeout(() => {
                    star.classList.remove('pop');
                }, 500);
            });
        });
    });
}

function updateStars(ratingDiv, value) {
    const stars = ratingDiv.querySelectorAll('.star');
    stars.forEach(star => {
        if (parseInt(star.dataset.value) <= value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Invia il voto
voteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Sicurezza: controlla che tutti i campi siano votati
    if (Object.values(votes).some(v => v === 0)) {
        alert('Assicurati di aver votato tutte le categorie!');
        goToStep(1); // torna all'inizio in caso di errore
        return;
    }

    try {
        const res = await fetch('/api/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voterId, ...votes })
        });

        const data = await res.json();
        if (res.ok) {
            // ROCKET ANIMATION (Reverted to CSS overlay)
            const rocketBtn = document.getElementById('submit-vote');
            if (rocketBtn) rocketBtn.classList.add('rocket-blast');
            
            setTimeout(() => {
                const overlay = document.getElementById('flame-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden');
                    overlay.classList.remove('launch');
                    overlay.classList.remove('fade-out');
                    void overlay.offsetWidth;
                    overlay.classList.add('launch');

                    setTimeout(() => {
                        // Cambia la pagina quando lo schermo è completamente coperto di nero dalla scia
                        if (currentSessionId) {
                            lastVotedSessionId = currentSessionId;
                            localStorage.setItem('lastVotedSessionId', currentSessionId);
                            switchPanel(alreadyVotedMsg, true); // Salta animazione Vespa
                        }
                        
                        // Fai cadere le pizze dietro le quinte
                        createPizzaRain();
                        
                    }, 600); // Metà corsa del razzo

                    setTimeout(() => {
                        // Il contenuto ora è caricato e ha finito il "pop". Sfumiamo dolcemente il nero.
                        overlay.classList.add('fade-out');
                    }, 1400); 

                    setTimeout(() => {
                        // Reset completo a bocce ferme
                        overlay.classList.add('hidden');
                        overlay.classList.remove('launch');
                        overlay.classList.remove('fade-out');
                        if (rocketBtn) rocketBtn.classList.remove('rocket-blast');
                    }, 2000); 
                }
            }, 100); // aspetta un attimo che il razzo inizi a partire
        } else {
            alert(data.error || 'Errore durante l\'invio del voto');
        }
    } catch (err) {
        console.error(err);
        alert('Errore di rete.');
    }
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// Polling
let previousSessionId = null;

async function checkSession() {
    try {
        const res = await fetch('/api/session');
        const session = await res.json();

        if (session.active && session.currentPizzaId) {
            currentSessionId = session.sessionId;
            
            // Se la sessione è appena cambiata/avviata, esci dalla leaderboard per far votare la nuova pizza
            if (currentSessionId && currentSessionId !== previousSessionId && previousSessionId !== null) {
                viewingLeaderboard = false;
                stopFireworks();
            }
            
            if (!viewingLeaderboard) {
                if (currentSessionId && currentSessionId === lastVotedSessionId) {
                    switchPanel(alreadyVotedMsg);
                } else {
                    switchPanel(votingPanel);
                    
                    // Se la sessione è appena cambiata/avviata, resetta gli step e i voti per prepararsi alla nuova pizza
                    if (currentSessionId !== previousSessionId) {
                        document.querySelectorAll('.star-rating').forEach(div => updateStars(div, 0));
                        Object.keys(votes).forEach(k => {
                            votes[k] = 0;
                            const pie = document.getElementById(`pie-${k}`);
                            if(pie) pie.style.strokeDasharray = '0 158';
                        });
                        goToStep(1);
                    }
                }
            }
            previousSessionId = currentSessionId;
        } else {
            if (!viewingLeaderboard) switchPanel(noSessionMsg);
        }
        
        // Gestione Leaderboard
        if (viewingLeaderboard) {
            const leaderboardWaiting = document.getElementById('leaderboard-waiting');
            const leaderboardResults = document.getElementById('leaderboard-results');
            
            if (session.resultsRevealed) {
                if (!leaderboardRendered) {
                    // Pulisci prima di mostrare per evitare flash di podi precedenti
                    document.getElementById('podium-container').innerHTML = '';
                    document.getElementById('leaderboard-others').innerHTML = '';
                    leaderboardWaiting.classList.add('hidden');
                    leaderboardResults.classList.remove('hidden');
                    fetchAndRenderLeaderboard();
                }
            } else {
                leaderboardWaiting.classList.remove('hidden');
                leaderboardResults.classList.add('hidden');
                leaderboardRendered = false;
                document.getElementById('podium-container').innerHTML = '';
                document.getElementById('leaderboard-others').innerHTML = '';
                stopFireworks();
            }
        }
    } catch (err) {
        console.error('Errore nel recuperare la sessione:', err);
    }
}

// Funzione Pizza Rain
function createPizzaRain() {
    for (let i = 0; i < 15; i++) {
        const pizza = document.createElement('div');
        pizza.textContent = '🍕';
        pizza.className = 'falling-pizza';
        pizza.style.left = Math.random() * 100 + 'vw';
        // Varia la velocità e il ritardo per un effetto a cascata realistico
        pizza.style.animationDuration = Math.random() * 2 + 3 + 's'; 
        pizza.style.animationDelay = Math.random() * 0.5 + 's'; 
        // Varia la grandezza
        const size = Math.random() * 1.5 + 1;
        pizza.style.fontSize = size + 'rem';
        
        document.body.appendChild(pizza);

        // Pulizia dopo l'animazione
        setTimeout(() => pizza.remove(), 6000);
    }
}

// Funzione Bottone Divertente Vespa
window.triggerFunVespa = function() {
    const vespaTransition = document.getElementById('vespa-transition');
    if (!vespaTransition) return;
    
    // Evita sovrapposizioni se l'animazione è già in corso
    if (vespaTransition.classList.contains('active')) return;

    // Disabilita lo sfondo oscurante per mostrare la pagina sotto
    vespaTransition.classList.add('no-wipe');
    
    // Fai partire l'animazione
    vespaTransition.classList.remove('hidden');
    void vespaTransition.offsetWidth; // trigger reflow
    vespaTransition.classList.add('active');

    // Resetta dopo 1.0s
    setTimeout(() => {
        vespaTransition.classList.remove('active');
        vespaTransition.classList.add('hidden');
        
        setTimeout(() => {
            vespaTransition.classList.remove('no-wipe');
        }, 100);
    }, 1000);
};

// --- LEADERBOARD LOGIC ---
let viewingLeaderboard = false;
let fireworksInterval = null;
let leaderboardRendered = false;

window.goToLeaderboard = function() {
    viewingLeaderboard = true;
    switchPanel(document.getElementById('leaderboard-panel'));
    history.pushState({ panel: 'leaderboard' }, '', '#classifica');
    checkSession(); 
};

window.exitLeaderboard = function() {
    if (history.state && history.state.panel === 'leaderboard') {
        history.back(); // Questo attiverà popstate che chiamerà performExitLeaderboard
    } else {
        performExitLeaderboard();
    }
};

function performExitLeaderboard() {
    viewingLeaderboard = false;
    leaderboardRendered = false;
    document.getElementById('podium-container').innerHTML = '';
    document.getElementById('leaderboard-others').innerHTML = '';
    stopFireworks();
    checkSession();
}

window.addEventListener('popstate', (e) => {
    if (!e.state || e.state.panel !== 'leaderboard') {
        if (viewingLeaderboard) {
            performExitLeaderboard();
        }
    }
});

async function fetchAndRenderLeaderboard() {
    if (leaderboardRendered) return;
    leaderboardRendered = true;
    
    const container = document.getElementById('podium-container');
    const others = document.getElementById('leaderboard-others');
    container.innerHTML = '';
    others.innerHTML = '';
    
    try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) return;
        const scores = await res.json();
        
        if (scores.length === 0) return;
        
        // Ordine del podio visivo: 2° (sinistra), 1° (centro), 3° (destra)
        const top3 = [
            { pos: 2, data: scores[1], class: 'silver', medal: '🥈' },
            { pos: 1, data: scores[0], class: 'gold', medal: '🏆' },
            { pos: 3, data: scores[2], class: 'bronze', medal: '🥉' }
        ];
        
        top3.forEach(place => {
            if (!place.data) return;
            const step = document.createElement('div');
            // Parti senza la classe del colore e senza la medaglia visibile
            step.className = `podium-step`;
            
            step.innerHTML = `
                <div class="medal">${place.medal}</div>
                <div class="podium-score">${place.data.totalScore}</div>
                <div class="podium-pizza-name">${place.data.name}</div>
            `;
            // Calcola l'altezza finale basata sulla posizione
            const finalHeight = place.pos === 1 ? '250px' : place.pos === 2 ? '180px' : '130px';
            
            // Suspense animation: su e giù per 4 secondi prima del risultato finale
            step.style.transition = 'height 0.25s ease-in-out';
            step.style.height = '50px';
            
            let suspenseCount = 0;
            const suspenseInterval = setInterval(() => {
                step.style.height = Math.floor(Math.random() * 120 + 80) + 'px';
                suspenseCount++;
                
                if (suspenseCount >= 16) { // 16 * 250ms = 4000ms (4 secondi)
                    clearInterval(suspenseInterval);
                    step.style.transition = 'height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    step.style.height = finalHeight;
                    // Aggiungi i colori reali e fai cadere le medaglie
                    step.classList.add(place.class);
                    step.classList.add('show-medal');
                }
            }, 250);
            
            container.appendChild(step);
        });
        
        // Fai partire i fuochi d'artificio in sincrono con la fine della suspense (4 secondi)
        setTimeout(() => {
            if (viewingLeaderboard && !fireworksInterval) {
                startFireworks();
            }
        }, 4000);
        
        // Altri classificati
        if (scores.length > 3) {
            others.innerHTML = '<h3>Altri Risultati</h3><ul style="list-style: none; padding: 0; text-align: left;">';
            for (let i = 3; i < scores.length; i++) {
                others.innerHTML += `<li style="padding: 0.5rem; background: rgba(255,255,255,0.1); margin-bottom: 0.5rem; border-radius: 8px;"><strong>#${i+1}</strong> ${scores[i].name} - Punteggio: ${scores[i].totalScore}</li>`;
            }
            others.innerHTML += '</ul>';
        }
    } catch (err) {
        console.error('Errore leaderboard:', err);
    }
}

function startFireworks() {
    if (fireworksInterval) return;
    fireworksInterval = setInterval(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = (Math.random() * 80 + 10) + 'vw';
        firework.style.top = (Math.random() * 50 + 10) + 'vh';
        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 2000);
    }, 500);
}

function stopFireworks() {
    if (fireworksInterval) {
        clearInterval(fireworksInterval);
        fireworksInterval = null;
    }
    document.querySelectorAll('.firework').forEach(f => f.remove());
}

// Polling di base per la sessione
setInterval(checkSession, 5000); // Polling ridotto a 5s dato che usiamo SSE

// SSE (Server-Sent Events) per sincronizzazione in tempo reale della classifica
const sseEventSource = new EventSource('/api/stream');
sseEventSource.addEventListener('reveal', (e) => {
    const data = JSON.parse(e.data);
    if (viewingLeaderboard && data.resultsRevealed) {
        // Selettivamente ricarichiamo la sessione subito per tutti i client nello stesso istante!
        checkSession();
    }
});

// Avvio
checkSession();
