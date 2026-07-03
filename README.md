# PizzAdvisor

PizzAdvisor è un'applicazione web per gestire sessioni di degustazione e valutazione di pizze. Permette a un gruppo di utenti di votare diverse pizze in tempo reale, mentre un amministratore gestisce le sessioni, le pizze disponibili e i risultati.

## Funzionalità Principali

### Lato Utente
- **Votazione in tempo reale**: Gli utenti possono votare la pizza attualmente in degustazione (impostata dall'amministratore).
- **Criteri di valutazione**: La valutazione si basa su parametri di voto configurabili (di default: Gusto, Croccantezza, Filamento, Vista, Qualità/Prezzo).
- **Classifica**: Quando l'amministratore rivela i risultati, gli utenti possono visualizzare la classifica finale con i punteggi medi calcolati.

### Lato Amministratore
- **Gestione Pizze**: Aggiunta, modifica ed eliminazione delle pizze (nome, marca, costo).
- **Gestione Sessioni**: Avvio e interruzione delle sessioni di voto e selezione della pizza corrente.
- **Rivelazione Risultati**: Possibilità di mostrare o nascondere la classifica agli utenti.
- **Gestione Parametri**: Configurazione personalizzata dei parametri di valutazione.
- **Reset**: Azzeramento dei voti per iniziare una nuova competizione/sessione.

## Installazione e Avvio

1. Assicurati di avere [Node.js](https://nodejs.org/) installato.
2. Posizionati nella cartella del progetto: `c:\repos\pizzAdvisor`.
3. Installa le dipendenze:
   ```bash
   npm install
   ```
4. Avvia il server:
   ```bash
   npm start
   ```
   *(oppure usa `npm run dev` / `node server.js`)*
5. Apri il browser all'indirizzo: [http://localhost:3000](http://localhost:3000)

## Utilizzo

### Accesso Utente
Gli utenti accedono semplicemente alla pagina principale (es. `http://localhost:3000`). Se è attiva una sessione di voto per una pizza, vedranno il modulo per esprimere il proprio giudizio; altrimenti visualizzeranno un messaggio di attesa o la classifica (se quest'ultima è stata svelata dall'amministratore).

### Accesso Amministratore
L'area di amministrazione si trova alla pagina `/admin.html` (es. `http://localhost:3000/admin.html`).
- **PIN di default per l'accesso**: `6767`

## Struttura del Progetto

- `server.js`: Server backend Node.js/Express. Gestisce le API REST e serve i file statici.
- `data.json`: Database locale (file JSON) dove vengono salvate permanentemente pizze, voti, stato delle sessioni e impostazioni.
- `public/`: Contiene il frontend dell'applicazione.
  - `index.html` / `app.js`: Interfaccia utente.
  - `admin.html` / `admin.js`: Interfaccia di amministrazione.
  - `style.css`: Stili dell'applicazione.
  - `images/`: Risorse grafiche.
- `package.json`: Definizione del progetto, dipendenze (Express) e script.

## Note di Sviluppo
- I dati sono salvati localmente nel file `data.json`. Se il file viene svuotato o se si riscontrano problemi di lettura, l'app genera un fallback con valori di default, e popolerà/creerà il file al primo salvataggio utile.
- Questo `README.md` verrà aggiornato ad ogni modifica importante per mantenere traccia del funzionamento del portale.
