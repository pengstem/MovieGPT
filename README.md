# MovieGPT

[English](README.md) | [中文](README.zh-CN.md)

<div align="center">

![Python](https://img.shields.io/badge/Python-3.13+-blue?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7+-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-GPL_v3-red?style=flat-square)

**An AI assistant for querying an IMDb movie database with natural language**

 Powered by Google Gemini | FastAPI backend | React frontend | Docker ready

</div>

---

## Overview

MovieGPT is a proof-of-concept chat assistant that lets you explore a local IMDb database using natural language. The backend converts your questions to SQL with Google Gemini and executes them on a MySQL instance. A React interface offers a streamlined chat experience with example prompts and message history.

### Key Features

| Feature | Description |
|------|------|
| **Natural language queries** | Ask about the movie dataset in plain language. Gemini generates SQL and executes it on MySQL. |
| **Stream or batch replies** | The FastAPI backend supports regular JSON responses and optional streaming. |
| **Example prompts & history** | The React client provides example queries and stores chat history in memory with an option to clear it. |
| **Dockerised MySQL** | `docker-compose` supplies a MySQL 8 instance and loads the IMDb TSV files on first start via `db/init.sql`. |
| **One‑step startup** | Use the `start_dev.py` script to launch the whole stack. |
| **Dark mode toggle** | Switch between light and dark themes. |
| **Movie info panels** | Click movie titles to fetch details from OMDb. |

---

## Project Layout

```
MovieGPT/
├── backend/       # FastAPI server and Gemini integration
│  ├── fastapi_backend.py  # main FastAPI app
│  ├── get_info.py     # external API helpers
│  └── Schema.py      # database schema and integration
├── frontend/
│  └── moviegpt-react/   # React app
│    ├── src/components/ # React components
│    ├── src/services/  # API services
│    └── src/styles/   # CSS modules
├── db/          # SQL scripts used to load IMDb data
│  └── init.sql     # database initialisation script
├── docker-compose.yml  # spins up the MySQL service
└── start_dev.py     # convenience script for development
```

---

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 16+
-Docker & Docker Compose
- Google Gemini API key

### Installation

#### 1. Clone the project
```bash
git clone <your-repo-url>
cd MovieGPT
```

#### 2. Start the MySQL database
```bash
docker-compose up -d
```
 The first run imports IMDb data using `db/init.sql`

#### 3. Configure environment variables
Create a `.env` file with the following:
```env
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key_here

# MySQL configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=imdbuser
MYSQL_PASSWORD=imdbpass
MYSQL_DB=imdb

# OMDb API (optional)
OMDB_API_KEY=your_omdb_api_key_here

# Optional: custom system prompt
SYSTEM_PROMPT=You are an expert movie database assistant...
```

For the React frontend, set `REACT_APP_API_BASE_URL` in `frontend/moviegpt-react/.env` if the backend URL differs.

#### 4. Install Python dependencies
```bash
# Using pip
pip install -r requirements.txt

# Or using uv (recommended)
uv install
```

#### 5. Launch the development environment 
```bash
python start_dev.py
```
This automatically:
- Starts the FastAPI backend (http://localhost:8000)
- Starts the React frontend (http://localhost:3000)
- Opens your browser to the app

### Manual start (optional)
If you prefer full control:

**Backend**
```bash
cd backend
uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
cd frontend/moviegpt-react
npm install
npm start
```

---

## API Endpoints

### Backend API (FastAPI)

| Endpoint | Method | Description |
|------|------|------|
| `/api/chat` | POST | Send a user message and get the assistant reply |
| `/api/chat/stream` | POST | Same as above but returned as a server-sent event stream |
| `/api/info/{imdb_id}` | GET | Fetch extra movie info from OMDb by IMDb ID |
| `/api/history` | GET | Retrieve conversation history |
| `/api/clear` | POST | Clear stored history |
| `/health` | GET | Health check used by the frontend |

### Environment variables

| Name | Description | Default |
|--------|------|--------|
| `GOOGLE_API_KEY` | Gemini API key | required |
| `MYSQL_HOST` | MySQL host | localhost |
| `MYSQL_PORT` | MySQL port | 3306 |
| `MYSQL_USER` | MySQL username | imdbuser |
| `MYSQL_PASSWORD` | MySQL password | imdbpass |
| `MYSQL_DB` | MySQL database name | imdb |
| `SYSTEM_PROMPT` | Custom system prompt | optional |
| `OMDB_API_KEY` | OMDb API key used by `/api/info` | optional |

---

## Frontend Highlights

### Component structure
- **InputArea** – user input field
- **MessageList** – displays chat history
- **LoadingMessage** – shows progress while waiting for a reply
- **ExampleQueries** – handy example query buttons
- **SimpleConfirmDialog** – confirmation dialog
- **Markdown support** – responses render with `react-markdown`
- **MovieInfoPanel** – shows OMDb details when clicking a title
- **ThemeToggleButton** – light/dark switch

### Styling system
- Responsive design
- CSS modules
- Modern UI components
- Dark mode theme

---

## Development

### Dev mode
```bash
# Start everything
python start_dev.py

# Or individually
# Backend with reload
uvicorn backend.fastapi_backend:app --reload

# Frontend
cd frontend/moviegpt-react && npm start
```

### Testing
```bash
# Backend tests
python -m pytest backend/

# Frontend tests
cd frontend/moviegpt-react
npm test
```

### Production build
```bash
# Build the frontend
cd frontend/moviegpt-react
npm run build

# Run the backend with uvicorn
uvicorn backend.fastapi_backend:app --host 0.0.0.0 --port 8000
```

---

## Docker Deployment

### Current setup
The repo currently only contains Docker config for MySQL. Full containerisation is in progress.

```bash
# Start the MySQL service
docker-compose up -d

# Check service status
docker-compose ps

# Stop services
docker-compose down
```

### Coming soon
- Backend Dockerfile
- Frontend Dockerfile
- Full docker-compose orchestration

---

## Usage Examples

### Sample queries
```
User: "Show me the top rated 10 movies"
Assistant: runs SQL and returns the results...

User: "Which movies were released in 2020?"
Assistant: generates the corresponding query and displays the results...

User: "Tell me about The Shawshank Redemption"
Assistant: fetches and shows detailed info...
```

---

## Roadmap
See [TODO.md](TODO.md) for the full plan.

### Near-term goals
- [ ] Full Docker containerisation
- [ ] User authentication system
- [ ] Query caching improvements
- [x] Dark mode support

### Long-term plans
- [ ] Slack/Discord bot integration
- [ ] Multi-language localisation
- [ ] Mobile layout support
- [ ] Advanced search features

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the GNU General Public License v3.0 – see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- [Google Gemini](https://ai.google.dev/) – AI language model
- [IMDb](https://www.imdb.com/) – movie database
- [FastAPI](https://fastapi.tiangolo.com/) – modern Python web framework
- [React](https://reactjs.org/) – UI library
- [Docker](https://www.docker.com/) – container platform

---

<div align="center">

** Enjoy chatting with MovieGPT!**

If you find this project useful, please consider starring the repository 

</div>

