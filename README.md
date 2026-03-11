# StratisIO – Intelligent Multi-Cloud Orchestration Platform

**StratisIO** is an AI-powered cloud management platform designed to simplify multi-cloud deployments. It provides a unified dashboard for orchestrating containers, monitoring resource telemetry in real-time, and receiving intelligent cost-optimization recommendations.

## 🚀 Key Features
- **One-Click Deployment**: Deploy Nginx, Flask, or custom Docker images to simulated AWS/Azure environments.
- **AI Cloud Advisor**: Rule-based engine that recommends the best cloud provider based on traffic and budget.
- **Real-time Telemetry**: Live Plotly charts for CPU and Memory tracking across the infrastructure.
- **Auto-Scaling Engine**: Automated horizontal scaling logic for handling traffic spikes.
- **Incident Management**: Centralized alert feed for infrastructure health violations.

## 🛠️ Tech Stack
- **Frontend**: Streamlit (Python)
- **Backend API**: FastAPI
- **Virtualization**: Docker SDK for Python
- **AI Engine**: Custom rule-based scoring logic
- **Visualization**: Plotly & Pandas

## 📥 Installation

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd stratisio
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Docker**:
   Ensure Docker Desktop is running on your system for real orchestration. The app will fallback to **Demo Mode** if Docker is missing.

## 🏃 Execution

### Local Development (Manual)
1. Start the Backend:
   ```bash
   uvicorn backend.api:app --reload --port 8000
   ```
2. Start the Dashboard:
   ```bash
   streamlit run app.py
   ```

### Production Mode (Docker)
```bash
docker-compose up --build
```

---
*Created for B.Tech IT Final Year Project Submission.*
