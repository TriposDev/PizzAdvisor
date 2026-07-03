# PizzAdvisor

PizzAdvisor is a web application for managing pizza tasting and evaluation sessions. It allows a group of users to vote on different pizzas in real-time, while an administrator manages the active sessions, the available pizzas, and the leaderboard results.

## Main Features

### User Side
- **Real-time Voting**: Users can vote on the pizza currently being tasted (set by the administrator).
- **Evaluation Criteria**: Voting is based on configurable parameters (default: Taste, Crunchiness, Cheese Pull, Appearance, Value).
- **Leaderboard**: When the administrator reveals the results, users can view the final leaderboard with the total calculated scores.

### Administrator Side
- **Pizza Management**: Add, edit, and delete pizzas (name, brand, cost).
- **Session Management**: Start and stop voting sessions, and select the current pizza to vote on.
- **Reveal Results**: Ability to show or hide the leaderboard for the users.
- **Reset**: Reset votes to start a new competition/session from scratch.

## Installation and Setup

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Navigate to the project directory: `c:\repos\pizzAdvisor`.
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *(or use `npm run dev` / `node server.js`)*
5. Open your browser at: [http://localhost:3000](http://localhost:3000)

## Usage

### User Access
Users simply navigate to the main page (e.g., `http://localhost:3000`). If a voting session is active, they will see the form to submit their rating. Otherwise, they will see a waiting message or the final leaderboard (if revealed by the admin).

### Administrator Access
The admin area can be accessed via the `/admin` route (e.g., `http://localhost:3000/admin`).
- **Default access PIN**: `6767`

## Project Structure

- `server.js`: Node.js/Express backend server. Manages REST APIs and serves static files.
- `data.json`: Local database (JSON file) that permanently stores pizzas, votes, session states, and settings.
- `public/`: Contains the frontend of the application.
  - `index.html` / `app.js`: User interface.
  - `admin.html` / `admin.js`: Administrator interface.
  - `style.css`: Application styles.
  - `images/`: Graphic assets.
- `package.json`: Project definition, dependencies (Express), and scripts.

## Development Notes
- Data is saved locally in the `data.json` file. If the file is emptied or there are reading issues, the app generates a fallback with default values and will populate/create the file upon the first save.
- This `README.md` is updated with every major change to keep track of the portal's functionality.
