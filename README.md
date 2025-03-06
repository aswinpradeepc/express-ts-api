# Express TypeScript API 

Live Demo: [API Documentation](https://estro.radr.in/api-docs/)  

##  Overview

This is a robust, scalable API built with **Express.js** and **TypeScript**, designed for high-performance data collection and analysis. It features authentication, analytics, uptime monitoring, and report generation functionalities.

##  Features

-  **RESTful API**: Well-structured endpoints for seamless integration.
-  **Authentication**: Google OAuth & JWT-based security.
-  **Analytics**: Track device data and generate insightful reports.
-  **Uptime Monitoring**: Logs connection status with advanced reporting.
-  **Swagger Documentation**: Easily explore API endpoints.

##  Tech Stack

- **Backend**: Express.js (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Google OAuth & JWT
- **Dev Tools**: Docker, ESLint, Prettier
- **API Docs**: Swagger (OpenAPI 3.0)

##  Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/aswinpradeepc/express-ts-api.git
cd express-ts-api
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Set up environment variables  
Copy env.example to `.env` file in the root directory and configure it.

### 4️⃣ Run the application  
#### Development Mode
```bash
npm run dev
```
#### Production Mode
```bash
npm run build && npm start
```

### 5️⃣ Access the API Documentation  
Visit: **[Swagger UI](https://estro.radr.in/api-docs/)**

##  Docker Setup  

To run the API in a Docker container:

```bash
docker compose up --build -d
```

## 🧪 Running Tests
```bash
npm test
```

### 6️⃣ Generate Random Data  
If you need to generate random data for testing purposes, run the scripts located in `src/data-generation`:

```bash
npx ts-node <filename>
```

##  API Endpoints

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/auth/google`          | Initiate Google OAuth             |
| GET    | `/auth/google/callback` | Handle Google OAuth callback      |
| GET    | `/analytics/data`       | Retrieve device analytics         |
| GET    | `/uptime/data`          | Fetch uptime data for a device    |
| GET    | `/report/overall`       | Get a high-level analytics report |
| GET    | `/report/detailed`      | Get a detailed analytics report   |

---

🔹 **Author:** Aswin Pradeep C  
🔹 **Website:** [aswinpc.tech](https://aswinpc.tech)  


