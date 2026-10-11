# 🚀 Production Deployment Guide

This guide walks you through deploying the **Campus Lost and Found System** across different production environments.

---

## 📑 Deployment Options

1. [Option 1: Docker Compose (Recommended for Any Server / Local Testing)](#option-1-docker-compose-recommended)
2. [Option 2: Cloud PaaS Deployment (Render / Railway)](#option-2-cloud-paas-deployment-render--railway)
3. [Option 3: Traditional Linux VPS (Ubuntu / AWS EC2 / DigitalOcean)](#option-3-traditional-linux-vps-systemd--nginx)

---

## Option 1: Docker Compose (Recommended)

Everything is pre-configured with multi-stage Dockerfiles and Nginx reverse proxy.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Docker Compose installed.

### Commands

1. **Clone or navigate to the project directory:**
   ```bash
   cd d:\LostAndFound
   ```

2. **Build and start all containers:**
   ```bash
   docker compose up --build -d
   ```

3. **Check running containers:**
   ```bash
   docker compose ps
   ```

4. **Access the application:**
   * **Web App (Frontend + Reverse Proxy):** [http://localhost](http://localhost) (or [http://localhost:3000](http://localhost:3000))
   * **Backend REST API:** [http://localhost:8080](http://localhost:8080)
   * **MySQL Database:** `localhost:3306`

5. **Stop containers:**
   ```bash
   docker compose down
   ```

> [!TIP]
> Persistent volumes (`mysql_data` and `uploads_data`) ensure your database records and uploaded images are never lost when containers restart.

---

## Option 2: Cloud PaaS Deployment (Render / Railway)

### Step 1: Managed MySQL Database
1. Create a MySQL database instance on [Railway](https://railway.app), [Aiven](https://aiven.io), or [PlanetScale].
2. Copy your connection URL, username, and password.

### Step 2: Deploy Spring Boot Backend
1. Create a **New Web Service** pointing to the `backend/` directory of your GitHub repository.
2. Select **Java** environment (or Dockerfile).
3. Set the following **Environment Variables**:
   * `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:<port>/<dbname>?createDatabaseIfNotExist=true&useSSL=false`
   * `SPRING_DATASOURCE_USERNAME`: `<username>`
   * `SPRING_DATASOURCE_PASSWORD`: `<password>`
   * `JWT_SECRET`: `<your-random-64-char-hex-secret>`
   * `PORT`: `8080` (or platform default)
4. Build command: `./mvnw clean package -DskipTests`
5. Start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

### Step 3: Deploy React Frontend
1. Deploy `frontend/` as a **Static Site** (on Vercel, Netlify, or Render).
2. Configure **Environment Variables**:
   * `VITE_API_BASE_URL`: `https://<your-backend-url>/api`
   * `VITE_SERVER_URL`: `https://<your-backend-url>`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add Single Page App rewrite rule (Redirect `/*` to `/index.html` with status 200).

---

## Option 3: Traditional Linux VPS (Systemd + Nginx)

### 1. Build Production Artifacts Locally

```bash
# Build Backend JAR
cd backend
mvn clean package -DskipTests

# Build Frontend Static Assets
cd ../frontend
npm run build
```

The output artifacts are:
* Backend: `backend/target/backend-0.0.1-SNAPSHOT.jar`
* Frontend: `frontend/dist/`

### 2. Configure Backend as a Linux Systemd Service

Create `/etc/systemd/system/lostandfound.service`:

```ini
[Unit]
Description=Campus Lost and Found Backend Service
After=syslog.target network.target mysql.service

[Service]
User=ubuntu
WorkingDirectory=/var/www/lostandfound/backend
ExecStart=/usr/bin/java -jar /var/www/lostandfound/backend/backend-0.0.1-SNAPSHOT.jar
Environment="PORT=8080"
Environment="SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/laf?useSSL=false&serverTimezone=UTC"
Environment="SPRING_DATASOURCE_USERNAME=Vidya143"
Environment="SPRING_DATASOURCE_PASSWORD=Vidya@143"
Environment="JWT_SECRET=94a08da1fecbb6e8b46990538c7b50b240ce4d93e78df794bdf34a5d4a13e2e0"
Environment="UPLOAD_DIR=/var/www/lostandfound/uploads"
SuccessExitStatus=143
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable lostandfound
sudo systemctl start lostandfound
```

### 3. Configure Nginx on Server

Create `/etc/nginx/sites-available/lostandfound`:

```nginx
server {
    listen 80;
    server_name your-domain.edu; # or server IP

    root /var/www/lostandfound/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:8080/uploads/;
        proxy_set_header Host $host;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/lostandfound /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 Production Security Checklist

* [x] Passwords hashed using **BCrypt** (10+ rounds).
* [x] Sensitive database credentials and JWT secret injectable via **Environment Variables**.
* [x] `password_hash` omitted from JSON serialization with `@JsonIgnore`.
* [x] Stateless JWT authentication.
* [x] Secure CORS configuration supporting frontend production origins.
* [x] Nginx gzip compression and SPA route fallback configured.
