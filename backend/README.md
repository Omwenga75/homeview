# HomeView Backend

This is the FastAPI backend for the HomeView property management system, using PostgreSQL for data storage.

## Setup

1. Install PostgreSQL and create a database named `homeview`.

2. Create a `.env` file in the `backend/` folder or set the environment variable directly:
   ```bash
   DATABASE_URL=postgresql://postgres:your_password@localhost/homeview
   ```

   You can also use the provided `.env.example` file as a template.

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000`.

## API Endpoints

- `GET /` - Welcome message
- `POST /houses/` - Create a new house
- `GET /houses/` - List all houses
- `GET /houses/{id}` - Get a specific house
- `PUT /houses/{id}` - Update a house
- `DELETE /houses/{id}` - Delete a house

## Features

- Real-time data with PostgreSQL
- FastAPI for high performance
- SQLAlchemy for ORM
- Alembic for migrations
- CORS enabled for frontend integration

## AI and Recommendations

Future enhancements will include Python AI libraries for property recommendations and automation.