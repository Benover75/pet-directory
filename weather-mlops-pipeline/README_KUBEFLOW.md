# Weather MLOps Pipeline - Kubeflow Edition

A comprehensive MLOps pipeline for weather data collection, preprocessing, and machine learning model training, now optimized for Kubeflow orchestration.

## 🚀 Features

- **Kubeflow Pipelines**: Cloud-native ML workflow orchestration
- **Containerized Operations**: Each pipeline step runs in isolated containers
- **Kubernetes Deployment**: Production-ready K8s configurations
- **Modern ML Stack**: Latest versions of pandas, scikit-learn, XGBoost, etc.
- **Monitoring & Logging**: MLflow and Weights & Biases integration
- **Security**: Built-in security scanning and best practices

## 📋 Prerequisites

- Python 3.8-3.11 (Kubeflow compatibility)
- Docker
- Kubernetes cluster (optional, for production)
- Kubeflow Pipelines SDK

## 🛠️ Installation

### 1. Install Dependencies

```bash
# Install the package with Kubeflow support
pip install -e ".[kubeflow]"

# Or install all dependencies
pip install -r requirements.txt
```

### 2. Verify Installation

```bash
# Test the CLI
weather-mlops-pipeline status

# Test Kubeflow pipeline compilation
python run_kubeflow_pipeline.py compile
```

## 🔧 Usage

### Local Development

```bash
# Run the traditional pipeline
weather-mlops-pipeline run all

# Run Kubeflow pipeline locally
python run_kubeflow_pipeline.py local

# Compile pipeline to YAML
python run_kubeflow_pipeline.py compile
```

### Kubeflow Cluster Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/kubeflow-deployment.yaml

# Run pipeline on cluster
python run_kubeflow_pipeline.py cluster
```

## 📊 Pipeline Components

The Kubeflow pipeline consists of 5 main stages:

1. **Fetch Weather Data** (`fetch_weather_component`)
   - Collects weather data from OpenWeatherMap API
   - Stores raw data in SQLite database

2. **Data Cleaning** (`clean_weather_component`)
   - Removes duplicates and invalid entries
   - Handles missing values
   - Exports cleaned data to CSV

3. **Feature Engineering** (`feature_engineering_component`)
   - Adds time-based features
   - Creates lag features
   - Normalizes numerical data

4. **Model Training** (`train_model_component`)
   - Trains Random Forest model
   - Saves model to disk
   - Logs metrics to MLflow

5. **Model Evaluation** (`evaluate_model_component`)
   - Generates performance metrics
   - Creates visualization plots
   - Exports evaluation report

## 🐳 Docker Support

### Build Kubeflow Image

```bash
# Build the Kubeflow-optimized image
docker build -f Dockerfile.kubeflow -t weather-mlops:kubeflow .

# Run container
docker run -p 8000:8000 weather-mlops:kubeflow
```

### Multi-stage Build

The `Dockerfile.kubeflow` is optimized for:
- Minimal image size
- Fast builds with layer caching
- Kubeflow compatibility
- Production readiness

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- kubectl configured
- Ingress controller (optional)

### Deploy

```bash
# Create namespace and deploy
kubectl apply -f k8s/kubeflow-deployment.yaml

# Check deployment status
kubectl get pods -n weather-mlops

# Access the API
kubectl port-forward svc/weather-mlops-service 8000:80 -n weather-mlops
```

## 🔍 Monitoring & Observability

### MLflow Integration

```bash
# Start MLflow tracking server
mlflow server --host 0.0.0.0 --port 5000

# View experiments
open http://localhost:5000
```

### Weights & Biases

```bash
# Login to W&B
wandb login

# Run pipeline with W&B logging
python run_kubeflow_pipeline.py local
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=weather_mlops_pipeline

# Run specific test categories
pytest test/test_ingest.py
pytest test/test_model.py
pytest test/test_preprocess.py
```

## 🔒 Security

### Security Scanning

```bash
# Run security checks
bandit -r weather_mlops_pipeline/
safety check

# Or install security extras
pip install -e ".[security]"
```

### Best Practices

- API keys stored in environment variables
- Container images scanned for vulnerabilities
- Network policies applied in K8s
- RBAC configured for cluster access

## 📈 Performance Optimization

### Pipeline Optimization

- **Parallel Execution**: Independent steps run in parallel
- **Caching**: Intermediate results cached between runs
- **Resource Limits**: CPU/memory limits configured
- **Auto-scaling**: HPA configured for production

### Monitoring Metrics

- Pipeline execution time
- Resource utilization
- Model performance metrics
- Data quality metrics

## 🚨 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   # Ensure package is installed
   pip install -e .
   ```

2. **Kubeflow Connection Issues**
   ```bash
   # Check KFP client connection
   python -c "import kfp; print(kfp.Client().list_experiments())"
   ```

3. **Docker Build Failures**
   ```bash
   # Clean and rebuild
   docker system prune -a
   docker build -f Dockerfile.kubeflow -t weather-mlops:kubeflow .
   ```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python run_kubeflow_pipeline.py local
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: README files
- **Community**: GitHub Discussions

---

**Happy MLOps-ing! 🎉** 