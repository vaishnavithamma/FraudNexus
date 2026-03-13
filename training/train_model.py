import pandas as pd
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
from imblearn.over_sampling import SMOTE

from xgboost import XGBClassifier
from catboost import CatBoostClassifier


# ===============================
# LOAD DATASET
# ===============================

df = pd.read_csv("../data/creditcard.csv").sample(50000, random_state=42)

print("Dataset loaded")


# ===============================
# SPLIT FEATURES AND LABEL
# ===============================

X = df.drop("Class", axis=1)
y = df["Class"]


# ===============================
# TRAIN TEST SPLIT
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42
)

print("Data split completed")


# ===============================
# HANDLE CLASS IMBALANCE
# ===============================

smote = SMOTE()

X_resampled, y_resampled = smote.fit_resample(X_train, y_train)

print("SMOTE applied")


# ===============================
# TRAIN XGBOOST
# ===============================

print("\nTraining XGBoost...\n")

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    n_jobs=-1,
    eval_metric="logloss"
)

xgb_model.fit(X_resampled, y_resampled)

xgb_preds = xgb_model.predict(X_test)

print("XGBoost Performance:\n")
print(classification_report(y_test, xgb_preds))

accuracy = accuracy_score(y_test, xgb_preds)
print("Accuracy:", accuracy)

probs = xgb_model.predict_proba(X_test)[:,1]
auc = roc_auc_score(y_test, probs)
print("ROC-AUC:", auc)


# ===============================
# TRAIN CATBOOST
# ===============================

print("\nTraining CatBoost...\n")

cat_model = CatBoostClassifier(
    iterations=200,
    depth=6,
    learning_rate=0.1,
    verbose=False
)

cat_model.fit(X_resampled, y_resampled)

cat_preds = cat_model.predict(X_test)

print("CatBoost Performance:\n")
print(classification_report(y_test, cat_preds))


# ===============================
# SAVE BEST MODEL
# ===============================

joblib.dump(xgb_model, "../models/fraud_model.pkl")

print("Best model saved (XGBoost)")


# ===============================
# SAVE FEATURE NAMES
# ===============================

with open("../models/features.json", "w") as f:
    json.dump(list(X.columns), f)

print("Feature names saved")