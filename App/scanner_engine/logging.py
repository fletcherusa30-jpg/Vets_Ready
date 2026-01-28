"""
scanner_engine/logging.py
Logging & diagnostics for VetsReady Scanner Engine.
Logs pipeline stages, OCR confidence, extraction, errors, and performance metrics.
"""
import logging

logging.basicConfig(
    filename='scanner_engine.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s'
)

def log_stage(stage: str, info: str = ""):
    logging.info(f"Stage: {stage} | {info}")

def log_error(error: str):
    logging.error(error)

def log_performance(stage: str, duration: float):
    logging.info(f"Performance: {stage} took {duration:.2f}s")
