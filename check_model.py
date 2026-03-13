import joblib

model = joblib.load("models/fraud_model.pkl")

print("MODEL TYPE:")
print(type(model))

print("\nMODEL DETAILS:")
print(model)

if hasattr(model, "n_features_in_"):
    print("\nNumber of features:", model.n_features_in_)

if hasattr(model, "feature_importances_"):
    print("\nFeature importance available")