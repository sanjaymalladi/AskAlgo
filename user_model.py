# user_model.py
from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['dsa_assistant']
users = db['users']

class UserModel:
    @staticmethod
    def get_user(user_id):
        return users.find_one({"user_id": user_id})

    @staticmethod
    def update_user(user_id, topic, proficiency, completed_exercise=None):
        users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    f"topics.{topic}.proficiency": proficiency,
                    f"topics.{topic}.last_interaction": datetime.utcnow()
                },
                "$addToSet": {
                    f"topics.{topic}.completed_exercises": completed_exercise
                } if completed_exercise else {}
            },
            upsert=True
        )

    @staticmethod
    def get_next_topic(user_id):
        user = UserModel.get_user(user_id)
        if not user or not user.get('topics'):
            return "introduction_to_dsa"
        
        topics = user['topics']
        return min(topics, key=lambda t: topics[t]['proficiency'])