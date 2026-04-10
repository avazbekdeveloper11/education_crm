# Education CRM

Modern education management system with a decoupled architecture.

## Architecture

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js (React framework)

## Project Structure

- `backend/`: API Gateway and Business Logic.
- `frontend/`: Web Dashboard and UI.
- `bot/`: Telegram Bot for notifications and interaction.

## Getting Started

1.  **Backend**: See [/backend/README.md](/backend/README.md) for setup.
2.  **Frontend**: See [/frontend/README.md](/frontend/README.md) for setup.
3.  **Telegram Bot**: See [/bot/README.md](/bot/README.md) for setup.

## Deployment (Docker)

To deploy the entire stack (PostgreSQL, Backend, and Bot) using Docker:

```bash
docker-compose up --build -d
```

Ensure you have updated the environment variables in `docker-compose.yml` or your `.env` files.
