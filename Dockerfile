FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY model ./model
COPY data ./data

# Pre-download the transformer during build so cold starts are less painful.
RUN python -c "from transformers import pipeline; pipeline('text-classification', model='distilbert/distilbert-base-uncased-finetuned-sst-2-english')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
