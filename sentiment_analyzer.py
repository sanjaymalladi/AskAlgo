# sentiment_analyzer.py
from textblob import TextBlob

def analyze_sentiment(text):
    blob = TextBlob(text)
    sentiment = blob.sentiment.polarity

    if sentiment < -0.5:
        return {
            "mood": "frustrated",
            "response": "I understand this might be frustrating. Let's take a step back and approach this from a different angle. What specific part is giving you trouble?",
            "sentiment_score": sentiment
        }
    elif sentiment < 0:
        return {
            "mood": "confused",
            "response": "It seems like you might be a bit confused. Would you like me to explain this concept in a different way or provide an example?",
            "sentiment_score": sentiment
        }
    elif sentiment < 0.5:
        return {
            "mood": "neutral",
            "response": "Alright, let's keep working on this. Do you have any specific questions about the current topic?",
            "sentiment_score": sentiment
        }
    else:
        return {
            "mood": "positive",
            "response": "Great! You seem to be understanding this well. Shall we move on to a more challenging aspect of this topic?",
            "sentiment_score": sentiment
        }

# Usage example
if __name__ == "__main__":
    user_message = "I don't understand this binary tree concept at all. It's so confusing!"
    result = analyze_sentiment(user_message)
    print(result)