"""
Model training pipeline for the AI scheduler recommender.

Trains a Random Forest classifier (and optionally XGBoost) on
synthetic workload data to predict the best scheduling algorithm.
"""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


FEATURE_NAMES = [
    "n_processes", "mean_burst", "std_burst", "cv_burst",
    "min_burst", "max_burst", "mean_arrival", "std_arrival",
    "arrival_spread", "mean_priority", "std_priority",
    "burst_skewness", "cpu_bound_ratio", "time_quantum",
]


class SchedulerTrainer:
    """Train and evaluate the scheduler recommendation model."""

    def __init__(self):
        self.model = None
        self.feature_names = FEATURE_NAMES

    def train(self, X: list, y: list, save_path: str = None) -> dict:
        """
        Train a Random Forest classifier.

        Args:
            X: List of feature vectors
            y: List of labels (algorithm names)
            save_path: Optional path to save the trained model

        Returns:
            Dict with accuracy, cv_scores, classification_report,
            and feature_importances.
        """
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.model_selection import cross_val_score, train_test_split
        from sklearn.metrics import classification_report, accuracy_score
        import joblib

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            random_state=42,
            n_jobs=-1,
        )
        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        cv_scores = cross_val_score(self.model, X, y, cv=5, n_jobs=-1)
        report = classification_report(y_test, y_pred, output_dict=True)

        # Feature importances
        importances = dict(zip(self.feature_names, self.model.feature_importances_))

        # Save model
        if save_path is None:
            save_path = os.path.join(os.path.dirname(__file__), "model.joblib")
        joblib.dump(self.model, save_path)
        print(f"✅ Model saved to {save_path}")

        return {
            "accuracy": round(accuracy, 4),
            "cv_mean": round(cv_scores.mean(), 4),
            "cv_std": round(cv_scores.std(), 4),
            "classification_report": report,
            "feature_importances": importances,
        }

    def train_xgboost(self, X: list, y: list) -> dict:
        """Train an XGBoost model for comparison."""
        try:
            from xgboost import XGBClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import accuracy_score, classification_report
            from sklearn.preprocessing import LabelEncoder

            le = LabelEncoder()
            y_encoded = le.fit_transform(y)

            X_train, X_test, y_train, y_test = train_test_split(
                X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
            )

            xgb = XGBClassifier(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.1,
                random_state=42,
                use_label_encoder=False,
                eval_metric="mlogloss",
            )
            xgb.fit(X_train, y_train)

            y_pred = xgb.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            report = classification_report(
                y_test, y_pred,
                target_names=le.classes_,
                output_dict=True,
            )

            return {
                "accuracy": round(accuracy, 4),
                "classification_report": report,
                "model_type": "XGBoost",
            }
        except ImportError:
            return {"error": "XGBoost not installed. Run: pip install xgboost"}


# ── CLI entry point ──

if __name__ == "__main__":
    from ai.dataset_generator import DatasetGenerator

    print("🔄 Step 1: Generating training data...")
    gen = DatasetGenerator(seed=42)
    X, y, records = gen.generate(n_samples=5000)
    print(f"   {len(X)} samples generated")

    print("🔄 Step 2: Training Random Forest...")
    trainer = SchedulerTrainer()
    results = trainer.train(X, y)
    print(f"   Accuracy: {results['accuracy']}")
    print(f"   CV Score: {results['cv_mean']} ± {results['cv_std']}")
    print(f"   Top features: {sorted(results['feature_importances'].items(), key=lambda x: -x[1])[:5]}")

    print("🔄 Step 3: Training XGBoost...")
    xgb_results = trainer.train_xgboost(X, y)
    if "error" not in xgb_results:
        print(f"   XGBoost Accuracy: {xgb_results['accuracy']}")
    else:
        print(f"   {xgb_results['error']}")
