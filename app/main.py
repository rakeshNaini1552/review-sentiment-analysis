from fastapi import FastAPI
from pydantic import BaseModel
from model.train import preprocess_data
import joblib
from fastapi.middleware.cors import CORSMiddleware

# Load the trained model and vectorizer
model = joblib.load('model/artifacts/model.pkl')
vectorizer = joblib.load('model/artifacts/vectorizer.pkl')

class ReviewRequest(BaseModel):
    review: str

class SentimentResponse(BaseModel):
    sentiment: str
    confidence: float
    label: int = None
    review: str = None

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
def predict_sentiment(input: ReviewRequest) -> SentimentResponse:
    # Preprocess the input review
    cleaned_review = preprocess_data(input.review)
    
    # Vectorize the cleaned review
    review_vector = vectorizer.transform([cleaned_review]).toarray()
    
    # Predict sentiment
    prediction = model.predict(review_vector)[0]
    confidence = max(model.predict_proba(review_vector)[0])
    
    sentiment = "positive" if prediction == 1 else "negative"
    
    return SentimentResponse(sentiment=sentiment, confidence=confidence, label=prediction, review=input.review)