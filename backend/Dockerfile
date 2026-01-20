# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing pyc files to disc
# PYTHONUNBUFFERED: Prevents Python from buffering stdout and stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
# libpq-dev is needed for building psycopg2 if installed from source
# But we used binary, so mostly just general utils. 
# ReportLab doesn't need external C libs heavily like WeasyPrint.
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
# We set a dummy secret key for build step because config('SECRET_KEY') might fail without env vars
# Or we can just rely on the fallback we added in settings.py
RUN python manage.py collectstatic --noinput

# Expose port (Railway expects env PORT or default 8000? Railway maps internal ports automatically usually)
EXPOSE 8000

# Start command
# Copy and setup start script
COPY start.sh /app/
RUN chmod +x /app/start.sh

# Start command
CMD ["/app/start.sh"]
