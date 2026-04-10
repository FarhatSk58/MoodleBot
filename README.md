# MoodleBot LMS

Welcome to MoodleBot! This Learning Management System features a modern frontend, an Express backend, and an intelligent AI processing pipeline that parses syllabuses, generates quizzes, and powers an AI teaching assistant.

## Project Structure

The repository is divided into three main components:
- **`client/`**: The frontend application built with React, Vite, and Tailwind CSS.
- **`server/`**: The backend RESTful API built with Node.js, Express, and MongoDB.
- **`ai-processing/`**: Dedicated utility scripts and cron jobs handling AI extraction, syllabus parsing, and batch operations via the Google Gemini API.

---

## 🚀 How to Run the Project Locally

To run the project on your machine, you'll need to run both the backend server and the frontend client simultaneously in separate terminal windows.

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Starting the Backend Server

The backend runs on Node.js and connects to a MongoDB database.

1. Open a new terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `server` directory. You will need to add your API keys inside (e.g., MongoDB URI, Gemini API key, Cloudinary keys, JWT Secret). 
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on its configured port (usually `http://localhost:5000` or `8000`).*

### 2. Starting the Frontend Client

The frontend is a Vite-powered React application.

1. Open a **second** terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend should now be running. You will see a local URL in your terminal (typically `http://localhost:5173`). Click it to open the app in your browser!*

### 3. AI Processing

The `ai-processing/` directory contains tools tailored for asynchronous tasks like batch prompt processing, answer scoring, and content analysis. 
- Background jobs are often triggered by the main backend server, but you can explore this folder to understand how the Gemini API parsing pipelines are structured.

---

## Environment Variables (.env)

Make sure you never commit your API keys. Both `server/.env` and `client/.env` are ignored by Git. 

If you are working with others, consider creating a `.env.example` file with just the variable names (but no actual values) so that your teammates know which keys they need to find.
