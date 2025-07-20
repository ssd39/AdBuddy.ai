#!/bin/bash

# Create virtual environment
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install --upgrade pip
pip install -r requirements.txt

echo "Virtual environment setup complete. Activate it with: source venv/bin/activate"