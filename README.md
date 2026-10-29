# 🌾 AgriConnect — Smart Farming Platform for Indian Farmers

AgriConnect is a production-grade full-stack MERN application engineered specifically for Indian farmers and agronomists. It unifies farm lifecycle monitoring, soil testing with rule-based recommendations, 5-day agro-meteorological forecasting with automated pest disease alarms, subsidized store purchasing, expert consultations, community forums, and comprehensive administrative oversight.

---

## 🛠️ Stack & Architecture

### Backend (`/server`)
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM (ObjectId references, timestamps, schema validations)
- **Security & Utilities**:
  - JWT (JSON Web Tokens) with 7-day expiration
  - Password hashing with `bcryptjs`
  - Input validation via `express-validator` and centralized `validate` middleware
  - HTTP security headers with `helmet`
  - Cross-Origin Resource Sharing with `cors` (configured for frontend port 5173)
  - HTTP request logging via `morgan`
  - Automated error-handling middleware returning standard `{ success, message, data }` responses
- **Integrations**:
  - OpenWeatherMap 5-day forecast API with automatic Indian agricultural mock fallback
  - In-database 30-minute weather cache
  - Rule-based agronomic inference engine for soil recommendations and meteorological pest hazards

### Frontend (`/client`)
- **Core**: React 18, Vite (Port 5173), React Router v6
- **UI Framework**: React-Bootstrap (Bootstrap 5) with custom agricultural green theme
- **Internationalization**: `react-i18next` with real-time persistent language switcher (English, हिन्दी, मराठी)
- **Data Visualizations**: Chart.js and `react-chartjs-2` for N-P-K profiles, pH trends, and admin metrics
- **HTTP Client**: Axios with Bearer token interceptor and auto-logout on 401
- **Notifications**: `react-toastify` for real-time feedback on user actions
- **Performance**: React `Suspense` and `React.lazy` route code-splitting

---

## 📋 Demo Login Credentials

Pre-populated via `npm run seed`:

| Role | Name | Email | Password | Region |
|---|---|---|---|---|
| **👑 Admin** | Admin AgriConnect | `admin@agriconnect.in` | `Admin@123` | Maharashtra |
| **🌾 Farmer 1** | Ramesh Patil | `farmer1@agriconnect.in` | `Farmer@123` | Punjab |
| **🌾 Farmer 2** | Sunita Devi | `farmer2@agriconnect.in` | `Farmer@123` | Maharashtra |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration
Create or inspect `server/.env`:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/agriconnect
JWT_SECRET=agriconnect_super_secret_jwt_key_2026
JWT_EXPIRE=7d
OPENWEATHER_API_KEY=
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Install All Dependencies & Seed Database
From the project root:
```bash
# Install root, server, and client dependencies
npm run install-all

# Seed database with demo accounts, farms, crops, products, and forum topics
npm run seed
```

### 4. Run Both Server & Client Concurrently
```bash
npm run dev
```
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🎯 Core Features

1. **Role-Based Authentication**:
   - Secure registration and login for farmers and administrators.
   - JWT tokens stored in `localStorage` with Bearer header injection on all requests.
   - Strict 403 Forbidden role guards for admin console and cross-user data isolation.

2. **Farm Profile Management**:
   - Register plots with name, location (village, district, state), area in hectares, soil classification, and irrigation method.
   - Farmers can only view, modify, or delete their own farms.

3. **Crop Lifecycle Monitoring**:
   - Track crop variety, planting date, expected harvest date, and live growth stages (`seed`, `germination`, `vegetative`, `flowering`, `fruiting`, `ripening`, `harvested`).
   - Chronological field activity log for watering, fertilization, pest spraying, and observations.

4. **Soil Health & Automated Recommendations**:
   - Log soil test readings: pH, Nitrogen (N), Phosphorus (P), Potassium (K), and Moisture (%).
   - Bar chart comparison of latest NPK values and line chart for historical pH trends.
   - Rule-based agronomist recommendations (e.g. lime application if pH < 6.0, sulfur if pH > 7.5, urea top-dressing if N < 50 kg/ha).

5. **Weather & Automated Disease Surveillance**:
   - 5-day weather forecast with temperature, humidity, wind, and rain probability.
   - Cached for 30 minutes to reduce external API overhead.
   - Automatic pest hazard generation:
     - **Humidity > 80%**: High Fungal Disease Risk (Powdery mildew/blast prevention).
     - **Temperature > 38°C**: Extreme Heat Stress & Aphid Alert.
     - **Heavy Precipitation / Rain > 70%**: Waterlogging & Root Rot Hazard.
     - **Humidity < 30%**: Drought & Spider Mite Warning.

6. **Farmer Input Store & Cart**:
   - Browse certified seeds, fertilizers (Urea, DAP), crop chemicals, and sprayers.
   - Dynamic stock counter that decrements upon successful order checkout.
   - Order tracking with status progression (`pending`, `confirmed`, `shipped`, `delivered`, `cancelled`).

7. **Agronomist Consultation & Community Forum**:
   - Ask agronomists questions with category tags and receive certified solutions.
   - Farmer discussion forum with category filters, like counters, and comment threads.

8. **Admin Operations Console**:
   - Dashboard telemetry with Chart.js analytics for users, farms, crops, and revenue.
   - User account activation/deactivation.
   - Store catalog additions, approvals, and order fulfillment status updates.
   - Regional emergency pest hazard broadcasts.

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Access |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Public |
| **Auth** | `POST` | `/api/auth/register` | Public |
| | `POST` | `/api/auth/login` | Public |
| | `GET` | `/api/auth/me` | Authenticated |
| | `PUT` | `/api/auth/me` | Authenticated |
| **Farms** | `GET` | `/api/farms` | Farmer (Own) |
| | `POST` | `/api/farms` | Farmer |
| | `GET` | `/api/farms/:id` | Owner / Admin |
| | `PUT` | `/api/farms/:id` | Owner / Admin |
| | `DELETE` | `/api/farms/:id` | Owner / Admin |
| **Crops** | `GET` | `/api/crops` | Farmer (Own) |
| | `POST` | `/api/crops` | Farmer |
| | `GET` | `/api/crops/:id` | Owner / Admin |
| | `POST` | `/api/crops/:id/activities` | Owner / Admin |
| **Soil** | `POST` | `/api/soil/:farmId` | Owner / Admin |
| | `GET` | `/api/soil/:farmId` | Owner / Admin |
| **Weather** | `GET` | `/api/weather` | Authenticated |
| | `POST` | `/api/weather/pest-check` | Authenticated |
| **Pest Alerts**| `GET` | `/api/pest-alerts` | Authenticated |
| | `POST` | `/api/pest-alerts` | Admin / Expert |
| | `DELETE` | `/api/pest-alerts/:id` | Admin |
| **Store** | `GET` | `/api/resources` | Authenticated |
| | `POST` | `/api/resources` | Admin |
| | `POST` | `/api/orders` | Farmer |
| | `GET` | `/api/orders` | Farmer (Own) |
| | `PUT` | `/api/orders/:id/status` | Admin |
| **Consultation**| `GET` | `/api/consultations` | Farmer (Own) |
| | `POST` | `/api/consultations` | Farmer |
| | `POST` | `/api/consultations/:id/replies`| Authenticated |
| **Forum** | `GET` | `/api/forum` | Authenticated |
| | `POST` | `/api/forum` | Authenticated |
| | `PUT` | `/api/forum/:id/like` | Authenticated |
| | `POST` | `/api/forum/:id/comments` | Authenticated |
| **Admin** | `GET` | `/api/admin/stats` | Admin Only |
| | `GET` | `/api/admin/users` | Admin Only |
| | `PUT` | `/api/admin/users/:id` | Admin Only |
| | `GET` | `/api/admin/orders` | Admin Only |

---

## 🧪 Postman Collection
Import `AgriConnect.postman_collection.json` directly into Postman to test all endpoints with pre-configured request bodies and bearer token variables.

