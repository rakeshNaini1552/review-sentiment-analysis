from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel
from model.train import preprocess_data
import joblib
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware

# Resolve absolute paths for model artifacts
BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = BASE_DIR.parent / "model" / "artifacts"

# this is the Bag of words way of doing things. You can swap this out with a more modern approach like using a transformer model (e.g. BERT) for better performance, but this is simpler and still works decently for our use case.
model = joblib.load(ARTIFACT_DIR / "model.pkl")
vectorizer = joblib.load(ARTIFACT_DIR / "vectorizer.pkl")

# Use a pipeline as a high-level helper. This is for BERT and abstracts away all the preprocessing, tokenization, etc. You can swap out the model name for any other transformer model that works for text classification (e.g. roberta, xlnet, etc.)
pipe = pipeline("text-classification", model="distilbert/distilbert-base-uncased-finetuned-sst-2-english")

class ReviewRequest(BaseModel):
    review: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    review: str = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict/bert")
def predict_sentiment(input: ReviewRequest) -> SentimentResponse:
    result = pipe(input.review)

    label = result[0]['label']
    score = result[0]['score']
    
    sentiment = "positive" if label == "POSITIVE" else "negative"
    
    return SentimentResponse(sentiment=sentiment, confidence=score, review=input.review)

# This is another way of sentiment analysis. BoW, vectorizing, and then feeding into a model is the traditional way of doing things and is more lightweight. Using a transformer model is more modern and typically has better performance, but is more complex and resource intensive. You can swap between the two approaches by commenting/uncommenting the relevant code sections.
@app.post("/predict/bow")
def predict_sentiment_bow(input: ReviewRequest) -> SentimentResponse:
    # Preprocess the input review
    cleaned_review = preprocess_data(input.review)
    
    # Vectorize the cleaned review
    review_vector = vectorizer.transform([cleaned_review]).toarray()
    
    # Predict sentiment
    prediction = model.predict(review_vector)[0]
    confidence = max(model.predict_proba(review_vector)[0])
    
    sentiment = "positive" if prediction == 1 else "negative"
    
    return SentimentResponse(sentiment=sentiment, confidence=confidence, label=prediction, review=input.review)
