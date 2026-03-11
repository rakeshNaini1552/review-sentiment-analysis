from pathlib import Path
import pandas as pd
import re
import nltk
from sklearn.feature_extraction.text import CountVectorizer, ENGLISH_STOP_WORDS
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import confusion_matrix, accuracy_score
import joblib

ps = nltk.PorterStemmer()
STOP_WORDS = set(ENGLISH_STOP_WORDS)
BASE_DIR = Path(__file__).resolve().parent

def preprocess_data(data: str) -> str:
    # clean a single review
    review = re.sub('[^a-zA-Z]', ' ', data)
    review = review.lower()
    review = review.split()
    review = [ps.stem(word) for word in review if word not in STOP_WORDS]
    review = ' '.join(review)
    return review


def train():
    # loads data, calls preprocess, vectorizes, trains, saves
    data_path = BASE_DIR.parent / 'data' / 'Restaurant_Reviews.tsv'
    artifacts_dir = BASE_DIR / 'artifacts'
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    data = pd.read_csv(data_path, delimiter='\t', quoting=3)
    cleaned_reviews = data['Review'].apply(preprocess_data)
    cv = CountVectorizer(max_features=1600)
    X = cv.fit_transform(cleaned_reviews).toarray()
    y = data.iloc[:, -1].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
    classifier = MultinomialNB()
    classifier.fit(X_train, y_train)
    y_pred = classifier.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    print(cm)
    accuracy = accuracy_score(y_test, y_pred)
    print(accuracy)
    joblib.dump(classifier, artifacts_dir / 'model.pkl')
    joblib.dump(cv, artifacts_dir / 'vectorizer.pkl')
   

if __name__ == "__main__":
    train()