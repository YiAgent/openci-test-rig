FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

FROM node:22-alpine
WORKDIR /app
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/package.json ./
COPY --from=backend /app ./backend
RUN apk add --no-cache python3 py3-pip
RUN pip install --no-cache-dir fastapi uvicorn pydantic --break-system-packages
EXPOSE 3000 8000
CMD ["sh", "-c", "cd /app/backend && python3 main.py & cd /app && npx next start"]
