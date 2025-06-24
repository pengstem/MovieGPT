# TODO List

This project aims to build a web application where users can query a MySQL database through a conversational AI interface. Below are suggested next steps to complete the initial version.

## 1. Environment and Database

- [x] Confirm that the Dockerized MySQL instance starts correctly using `docker-compose up -d`.
- [x] Load the IMDb dataset using the scripts in `db/`.
- [x] Verify database connectivity from the backend code (see `backend/testsql.py`).
- [ ] Store database credentials in environment variables instead of hardcoding them.

## 2. Backend API

- [ ] Choose a Python web framework (e.g., FastAPI or Flask) and create an API server.
- [ ] Implement endpoints for querying the database and interacting with the AI model.
- [ ] Integrate a language model (such as Google Gemini or OpenAI) to convert natural language questions into SQL queries.
- [ ] Add error handling and logging.
- [ ] Provide unit tests for API logic.

## 3. React Frontend

- [ ] Set up a React project (using Create React App or Vite).
- [ ] Build a chat interface that sends user questions to the backend API.
- [ ] Display AI responses and any retrieved movie data.
- [ ] Add environment variables for API URLs and keys.
- [ ] Style the interface for a responsive layout.

## 4. Containerization

- [ ] Create a Dockerfile for the backend API service.
- [ ] Create a separate Dockerfile for the React frontend.
- [ ] Update `docker-compose.yml` to orchestrate frontend, backend, and MySQL services together.

## 5. Deployment and Miscellaneous

- [ ] Configure a `.env` file or secret manager for API keys and database credentials.
- [ ] Add README instructions for running the project locally and in production.
- [ ] Consider adding authentication if the app will be publicly accessible.
- [ ] Write additional scripts to automate setup or data import as needed.
