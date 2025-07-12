import argparse
import sys
import os
from src.ingest.fetch_weather import fetch_weather, fetch_multiple_samples
from src.preprocess.clean_weather import clean_weather
from src.preprocess.feature_engineering import add_features
from src.train.train_model import train
from src.train.evaluate import evaluate
from src.utils.database import get_database_info, clear_old_data, export_to_csv
import pandas as pd
import yaml

VERSION = "2.0.0"

STAGES = ["fetch", "clean", "features", "train", "evaluate"]


def run_stages(stages):
    for stage in stages:
        if stage == "fetch":
            fetch_weather()
        elif stage == "clean":
            clean_weather()
        elif stage == "features":
            add_features()
        elif stage == "train":
            train()
        elif stage == "evaluate":
            evaluate()
        else:
            print(f"Unknown stage: {stage}")
            sys.exit(1)

def show_status():
    info = get_database_info()
    print("📊 Pipeline Status:")
    print(f"Database: {info['database_path']}")
    print(f"Records: {info['total_records']}")
    print(f"Size: {info['database_size_mb']} MB")
    model_path = "data/models/weather_model.pkl"
    print(f"Model: {'Exists' if os.path.exists(model_path) else 'Not found'} ({model_path})")
    print(f"Cleaned data: {'Exists' if os.path.exists('data/processed/weather_clean.csv') else 'Not found'}")

def show_stages():
    print("Available pipeline stages:")
    for s in STAGES:
        print(f"- {s}")

def show_data(head=5, tail=0):
    path = "data/processed/weather_clean.csv"
    if not os.path.exists(path):
        print("No cleaned data found. Run the pipeline first.")
        return
    df = pd.read_csv(path)
    if head:
        print(f"\nFirst {head} rows:")
        print(df.head(head))
    if tail:
        print(f"\nLast {tail} rows:")
        print(df.tail(tail))

def main():
    parser = argparse.ArgumentParser(description="Weather MLOps Pipeline CLI")
    parser.add_argument("--version", action="version", version=f"%(prog)s {VERSION}")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--config", type=str, default="config/config.yaml", help="Path to config file")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # run
    run_parser = subparsers.add_parser("run", help="Run pipeline stages")
    run_parser.add_argument("stages", nargs="*", choices=["all"] + STAGES, default=["all"], help="Stages to run (default: all)")

    # status
    subparsers.add_parser("status", help="Show pipeline status")

    # stages
    subparsers.add_parser("stages", help="List available pipeline stages")

    # show-data
    show_data_parser = subparsers.add_parser("show-data", help="Show sample cleaned data")
    show_data_parser.add_argument("--head", type=int, default=5, help="Show first N rows")
    show_data_parser.add_argument("--tail", type=int, default=0, help="Show last N rows")

    # db
    db_parser = subparsers.add_parser("db", help="Database utilities")
    db_sub = db_parser.add_subparsers(dest="db_command", required=True)
    db_sub.add_parser("info", help="Show database info")
    cleanup_parser = db_sub.add_parser("cleanup", help="Clean up old data")
    cleanup_parser.add_argument("--days", type=int, default=30, help="Days to keep")

    # export
    export_parser = subparsers.add_parser("export", help="Export data to CSV")
    export_parser.add_argument("--file", type=str, default=None, help="Output CSV file path")

    args = parser.parse_args()

    if args.verbose:
        print("[Verbose mode enabled]")

    if args.command == "run":
        stages = args.stages
        if "all" in stages:
            stages = STAGES
        run_stages(stages)
    elif args.command == "status":
        show_status()
    elif args.command == "stages":
        show_stages()
    elif args.command == "show-data":
        show_data(head=args.head, tail=args.tail)
    elif args.command == "db":
        if args.db_command == "info":
            info = get_database_info()
            print("Database Info:")
            for k, v in info.items():
                print(f"{k}: {v}")
        elif args.db_command == "cleanup":
            deleted = clear_old_data(args.days)
            print(f"Deleted {deleted} records older than {args.days} days.")
    elif args.command == "export":
        filename = export_to_csv(args.file)
        print(f"Exported data to {filename}")
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 