#!/usr/bin/env python3
"""
Kubeflow Pipeline Runner for Weather MLOps
"""

import kfp
from kfp import dsl
import os
import sys
from pipelines.kubeflow_pipeline import weather_ml_pipeline

def compile_pipeline():
    """Compile the pipeline to YAML"""
    print("🔄 Compiling Kubeflow pipeline...")
    kfp.compiler.Compiler().compile(
        weather_ml_pipeline, 
        'weather_ml_pipeline.yaml'
    )
    print("✅ Pipeline compiled to weather_ml_pipeline.yaml")

def run_pipeline_locally():
    """Run the pipeline locally using KFP client"""
    print("🚀 Running pipeline locally...")
    
    # Initialize KFP client
    client = kfp.Client()
    
    # Compile and run
    compile_pipeline()
    
    # Submit the pipeline
    run = client.create_run_from_pipeline_func(
        weather_ml_pipeline,
        arguments={},
        run_name="weather-ml-pipeline-local"
    )
    
    print(f"✅ Pipeline submitted with run ID: {run.run_id}")
    print(f"🔗 View run at: {client.get_run_link(run.run_id)}")
    
    return run

def run_pipeline_on_cluster():
    """Run the pipeline on a Kubeflow cluster"""
    print("🚀 Running pipeline on Kubeflow cluster...")
    
    # Initialize KFP client for cluster
    client = kfp.Client(host='http://localhost:8080')  # Adjust host as needed
    
    # Compile and run
    compile_pipeline()
    
    # Submit the pipeline
    run = client.create_run_from_pipeline_func(
        weather_ml_pipeline,
        arguments={},
        run_name="weather-ml-pipeline-cluster"
    )
    
    print(f"✅ Pipeline submitted with run ID: {run.run_id}")
    print(f"🔗 View run at: {client.get_run_link(run.run_id)}")
    
    return run

def list_runs():
    """List recent pipeline runs"""
    print("📋 Listing recent pipeline runs...")
    
    try:
        client = kfp.Client()
        runs = client.list_runs()
        
        if runs.runs:
            print("\nRecent runs:")
            for run in runs.runs[:5]:  # Show last 5 runs
                print(f"  - {run.run.name}: {run.run.status} (ID: {run.run.id})")
        else:
            print("No runs found.")
            
    except Exception as e:
        print(f"❌ Error listing runs: {e}")

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python run_kubeflow_pipeline.py compile    # Compile pipeline to YAML")
        print("  python run_kubeflow_pipeline.py local      # Run pipeline locally")
        print("  python run_kubeflow_pipeline.py cluster    # Run pipeline on cluster")
        print("  python run_kubeflow_pipeline.py list       # List recent runs")
        return
    
    command = sys.argv[1].lower()
    
    if command == "compile":
        compile_pipeline()
    elif command == "local":
        run_pipeline_locally()
    elif command == "cluster":
        run_pipeline_on_cluster()
    elif command == "list":
        list_runs()
    else:
        print(f"❌ Unknown command: {command}")

if __name__ == "__main__":
    main() 