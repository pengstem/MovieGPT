# MovieGPT

MovieGPT is a proof-of-concept chat assistant that lets you explore a local copy of the IMDb
movie database using natural language.  The backend uses Google Gemini to turn your
questions into SQL queries and executes them on a MySQL instance.  A React based
frontend provides a simple chat interface with example prompts and a message history.

## Features

- **Conversational querying** – ask questions about the movie dataset in plain
  language.  Gemini generates the SQL and the backend runs it on MySQL.
- **Stream or batch replies** – the Flask API supports both regular JSON
  responses and optional streaming.
- **Example prompts & history** – the React client includes sample queries,
  keeps chat history in memory and lets you clear it with a confirmation dialog.
- **Dockerised MySQL** – `docker-compose` provisions a MySQL 8 instance and
  loads the IMDb TSV files on first start via `db/init.sql`.

## Project layout

```
backend/    # Flask server and Gemini integration
frontend/   # React client (TypeScript)
db/         # SQL scripts used to load the IMDb dataset
docker-compose.yml  # spins up the MySQL service
```

### Backend

The Flask app exposes the following endpoints:

- `POST /api/chat` – send a user message and get the assistant reply
- `POST /api/chat/stream` – same as above but returned as a server-sent event stream
- `GET  /api/history` – retrieve conversation history
- `POST /api/clear` – clear the stored history
- `GET  /health` – health check used by the frontend

Configuration is supplied through environment variables:

```
GOOGLE_API_KEY   # Gemini API key
MYSQL_HOST       # MySQL host (default localhost)
MYSQL_PORT       # MySQL port (default 3306)
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DB
SYSTEM_PROMPT    # optional custom system prompt for Gemini
```

See `backend/Schema.py` for the integration details.

### Frontend

The React client lives under `frontend/moviegpt-react` and was bootstrapped
with Create React App.  It uses TypeScript and CSS modules.  The
`apiService.ts` file defines all calls to the backend API.
Run it in development mode with:

```bash
cd frontend/moviegpt-react
npm install
npm start
```

The app will open at `http://localhost:3000` and will communicate with the
backend running on port 8000.

## Getting started

1. **Start MySQL**
   ```bash
   docker-compose up -d
   ```
   The first run will import the IMDb data using `db/init.sql`.

2. **Create a `.env` file** with your Google API key and database credentials.

3. **Install Python dependencies** (Python 3.13 or newer):
   ```bash
   pip install flask flask-cors google-genai mysql-connector-python pymysql \
      cryptography python-dotenv
   ```

4. **Run the backend**
   ```bash
   python backend/start_server.py
   ```

5. **Run the frontend** (in another terminal):
   ```bash
   cd frontend/moviegpt-react
   npm install
   npm start
   ```

Navigate to `http://localhost:3000` to start chatting with MovieGPT.

## License

This project is licensed under the terms of the GNU General Public License v3.0.
