# TODO List

This project aims to build a web application where users can query a MySQL database through a conversational AI interface. Below are suggested next steps to complete the initial version.

## 1. Environment and Database

- [x] Confirm that the Dockerized MySQL instance starts correctly using `docker-compose up -d`.
- [x] Load the IMDb dataset using the scripts in `db/`.
- [x] Verify database connectivity from the backend code (see `backend/testsql.py`).
- [x] Store database credentials in environment variables instead of hardcoding them.

## 2. Backend API

- [X] Choose a Python web framework (e.g., FastAPI or Flask) and create an API server.
- [X] Implement endpoints for querying the database and interacting with the AI model.
- [X] Integrate a language model (such as Google Gemini or OpenAI) to convert natural language questions into SQL queries.
- [ ] Add error handling and logging.
- [ ] Provide unit tests for API logic.

## 3. React Frontend

- [x] Set up a React project (using Create React App or Vite).
- [x] Build a chat interface that sends user questions to the backend API.
- [x] Display AI responses and any retrieved movie data.
- [ ] Add environment variables for API URLs and keys.
- [ ] Style the interface for a responsive layout.

## 4. Containerization

- [ ] Create a Dockerfile for the backend API service.
- [ ] Create a separate Dockerfile for the React frontend.
- [ ] Update `docker-compose.yml` to orchestrate frontend, backend, and MySQL services together.

## 5. Deployment and Miscellaneous

- [x] Configure a `.env` file or secret manager for API keys and database credentials.
- [x] Add README instructions for running the project locally and in production.
- [ ] Consider adding authentication if the app will be publicly accessible.
- [ ] Write additional scripts to automate setup or data import as needed.

## 6. Additional Improvements

- [ ] Implement caching for frequent queries to reduce database load.
- [ ] Add API rate limiting to prevent abuse.
- [ ] Set up a CI/CD pipeline with GitHub Actions for automated tests and deployments.
- [ ] Provide a dark mode option in the frontend UI.
- [ ] Add localization support for multiple languages.
- [ ] Allow users to save favorite movies or create watchlists.
- [ ] Integrate error monitoring with a service like Sentry.
- [ ] Document API endpoints using Swagger or OpenAPI.
- [ ] Write end-to-end integration tests across frontend and backend.
- [ ] Explore creating a Slack or Discord bot interface for quick queries.
