"""
AI Scheduler Predictor.

Loads the trained model and predicts the best scheduling algorithm
for a given workload.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ai.feature_engineering import extract_features, features_to_vector


class SchedulerPredictor:
    """Predict the best scheduling algorithm for a workload."""

    def __init__(self, model_path: str = None):
        self.model = None
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), "model.joblib")
        self.model_path = model_path
        self._load_model()

    def _load_model(self):
        """Load the trained model from disk."""
        try:
            import joblib
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                print(f"✅ AI model loaded from {self.model_path}")
            else:
                print(f"⚠️  No trained model found at {self.model_path}")
                print("   Run: python3 api/ai/trainer.py to train one.")
        except Exception as e:
            print(f"⚠️  Failed to load model: {e}")

    def is_available(self) -> bool:
        """Check if a trained model is loaded."""
        return self.model is not None

    def predict(self, process_configs: list[dict], time_quantum: int = 2) -> dict:
        """
        Predict the best algorithm for a workload.

        Args:
            process_configs: List of process dicts (arrival, burst, priority)
            time_quantum:    Time quantum setting

        Returns:
            Dict with recommended_algorithm, confidence, and probabilities.
        """
        if not self.is_available():
            return {
                "error": "Model not trained yet. Run the training pipeline first.",
                "recommended_algorithm": None,
                "confidence": 0,
                "all_probabilities": {},
            }

        features = extract_features(process_configs, time_quantum)
        feat_vec = features_to_vector(features)

        prediction = self.model.predict([feat_vec])[0]
        probabilities = self.model.predict_proba([feat_vec])[0]

        prob_dict = {}
        for cls, prob in zip(self.model.classes_, probabilities):
            prob_dict[cls] = round(float(prob), 4)

        return {
            "recommended_algorithm": str(prediction),
            "confidence": round(float(max(probabilities)), 4),
            "all_probabilities": prob_dict,
            "features": features,
        }
