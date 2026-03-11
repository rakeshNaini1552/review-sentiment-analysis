# Sentiment Analysis — NLP to Production

A full-stack sentiment analysis application that classifies restaurant reviews as positive or negative. Built with a Naive Bayes classifier, served via a FastAPI REST API, and paired with a React frontend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| ML Model | Naive Bayes (scikit-learn) |
| Text Processing | NLTK — stemming, stopword removal |
| Vectorization | Bag of Words (CountVectorizer) |
| Backend API | FastAPI + Pydantic |
| Frontend | React + Vite |
| Model Persistence | joblib |

---

## Project Structure

```
fastapi-course/
├── app/
│   └── main.py               # FastAPI application & prediction endpoints
├── model/
│   ├── train.py              # Training script — run once to generate artifacts
│   └── artifacts/
│       ├── model.pkl         # Serialized Naive Bayes classifier
│       └── vectorizer.pkl    # Serialized CountVectorizer
├── data/
│   └── Restaurant_Reviews.tsv
├── sentiment-UI/             # React frontend
│   └── src/
│       └── App.jsx
├── requirements.txt
└── .gitignore
```

---

## Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd fastapi-course
```

### 2. Create a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # macOS/Linux
.venv\Scripts\activate         # Windows
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Train the model

```bash
python model/train.py
```

Expected output:
```
Accuracy : 0.7400
Confusion matrix:
[[71 25]
 [27 77]]
Artifacts saved to model/artifacts/
```

### 5. Start the API

```bash
uvicorn app.main:app --reload
```

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

## API Reference

### `POST /predict`

Predict the sentiment of a single review.

**Request**
```json
{
  "review": "The food was absolutely incredible!"
}
```

**Response**
```json
{
  "review": "The food was absolutely incredible!",
  "sentiment": "positive",
  "label": 1,
  "confidence": 0.9821
}
```

---

### `GET /health`

Check if the API and model are running.

**Response**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## How It Works

1. **Training** — `train.py` reads 1,000 labeled restaurant reviews, cleans the text (removes noise, lowercases, stems words, strips stopwords), fits a CountVectorizer to build a vocabulary, trains a Multinomial Naive Bayes classifier, and saves both the model and vectorizer to disk via `joblib`.

2. **Serving** — `main.py` loads the saved artifacts once at startup. On each `/predict` request, the incoming review is cleaned using the same preprocessing pipeline, transformed using the saved vectorizer (not re-fitted), and passed to the model for prediction.

3. **Frontend** — The React app sends a `POST` request to the API with the review text and displays the sentiment and confidence score returned in the response.

---

## Known Limitations

- The Bag of Words model does not understand word order or negation. A review like *"not bad"* may be misclassified because "not" is removed as a stopword, leaving only "bad".
- Trained on restaurant reviews only — performance may degrade on other domains.
- 74% accuracy on the test set — suitable for learning purposes, not production-critical use cases.

---

## Future Improvements

- Replace Naive Bayes with a transformer-based model (e.g. BERT) for better contextual understanding
- Add a `/predict/batch` endpoint for bulk predictions
- Containerize with Docker for easier deployment
- Deploy API to Railway or Render, frontend to Vercel