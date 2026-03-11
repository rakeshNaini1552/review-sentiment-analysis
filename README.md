---
title: Review Sentiment API
sdk: docker
app_port: 7860
---

# Sentiment Analysis — NLP to Production

A full-stack sentiment analysis application that classifies restaurant reviews as positive or negative. Supports two interchangeable model backends — a BERT transformer and a Naive Bayes classifier — selectable from the UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI + Pydantic |
| BERT Model | DistilBERT (Hugging Face Transformers) |
| BoW Model | Naive Bayes + CountVectorizer (scikit-learn) |
| Frontend | React + Vite |
| Backend Hosting | Render |
| Frontend Hosting | Vercel |

---

## Two Model Approaches

| | BERT | Naive Bayes |
|---|---|---|
| Accuracy | ~91% | ~74% |
| Understands negation | ✅ "not bad" → positive | ❌ strips "not" as stopword |
| Preprocessing needed | ❌ pipeline handles everything | ✅ stem + stopword removal |
| Model size | ~250MB | ~1MB |
| Inference speed | Slower | Very fast |
| Training required | ❌ pre-trained | ✅ run `train.py` first |

---

## Project Structure

```
review-sentiment-analysis/
├── app/
│   └── main.py               # FastAPI — both /predict/bert and /predict/bow endpoints
├── model/
│   ├── train.py              # BoW training script
│   └── artifacts/
│       ├── model.pkl         # Serialized Naive Bayes classifier
│       └── vectorizer.pkl    # Serialized CountVectorizer
├── data/
│   └── Restaurant_Reviews.tsv
├── sentiment-UI/
│   └── src/
│       └── App.jsx           # React frontend with model toggle
├── render.yaml
├── requirements.txt
└── .gitignore
```

---

## Local Setup

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository

```bash
git clone https://github.com/rakeshNaini1552/review-sentiment-analysis.git
cd review-sentiment-analysis
```

### 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Train the BoW model (required for /predict/bow)

```bash
python model/train.py
```

Expected output:
```
Accuracy : 0.7400
Confusion matrix:
[[71 25]
 [27 77]]
```

### 5. Start the API

```bash
python -m uvicorn app.main:app --reload
```

> First startup will be slow (~30s) as BERT downloads ~250MB. Subsequent startups load from cache.

API runs at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

### 6. Start the frontend

```bash
cd sentiment-UI
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Deployment

### Backend — Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Language:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - **Instance Type:** Starter ($7/mo) recommended — BERT requires ~500MB RAM
5. Click **Deploy Web Service**
6. Copy your live API URL

### Frontend — Vercel

1. Update `API_BASE` in `sentiment-UI/src/App.jsx`:
   ```javascript
   const API_BASE = "https://your-app-name.onrender.com";
   ```
2. Commit and push
3. Go to [vercel.com](https://vercel.com) → **New Project**
4. Import repo, set **Root Directory** to `sentiment-UI`
5. Click **Deploy**

---

## API Reference

### `POST /predict/bert`

Uses DistilBERT transformer for context-aware sentiment prediction.

**Request**
```json
{ "review": "The food was not bad at all!" }
```

**Response**
```json
{
  "review": "The food was not bad at all!",
  "sentiment": "positive",
  "confidence": 0.9823
}
```

---

### `POST /predict/bow`

Uses Naive Bayes + Bag of Words — lightweight and fast.

**Request**
```json
{ "review": "The food was not bad at all!" }
```

**Response**
```json
{
  "review": "The food was not bad at all!",
  "sentiment": "negative",
  "confidence": 0.7431
}
```

> Note the difference — BoW misclassifies "not bad" as negative because "not" is removed as a stopword. BERT correctly identifies it as positive.

---

## How It Works

1. **Training (BoW)** — `train.py` reads 1,000 labeled restaurant reviews, cleans the text, fits a CountVectorizer vocabulary, trains a Multinomial Naive Bayes classifier, and saves both artifacts via `joblib`.

2. **BERT** — `distilbert-base-uncased-finetuned-sst-2-english` is loaded from Hugging Face at startup. No preprocessing needed — the pipeline handles tokenization and inference internally.

3. **Serving** — both models load once at startup. `/predict/bert` and `/predict/bow` serve predictions from their respective models independently.

4. **Frontend** — the React app lets users toggle between BERT and Naive Bayes, sends a `POST` request to the selected endpoint, and displays the sentiment, confidence score, and which model was used.

---

## Known Limitations

- BoW does not understand negation or word order — "not bad" → negative
- Both models trained/fine-tuned on English only
- Free Render tier may run out of memory with BERT loaded — Starter plan recommended

---

## Future Improvements

- Fine-tune BERT on restaurant-specific data (e.g. Yelp dataset) for higher domain accuracy
- Add `/predict/batch` endpoint for bulk predictions
- Containerize with Docker for easier deployment
- Add side-by-side comparison mode in the UI
