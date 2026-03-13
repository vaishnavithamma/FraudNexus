import json
import joblib
import random

from engine.explainability import explain_transaction
from engine.behavior_analyzer import behavior_risk
from engine.device_fingerprint import device_risk
from engine.graph_detector import add_transaction, graph_risk
from engine.risk_scoring import final_risk
from engine.decision_engine import decision


# =========================
# LOAD MODEL
# =========================

model = joblib.load("models/fraud_model.pkl")

with open("models/features.json") as f:
    feature_names = json.load(f)


# =========================
# USER DATA
# =========================

known_devices = ["D1", "D2"]
avg_transaction_amount = 2000


# =========================
# PROCESS TRANSACTION
# =========================

def process_transaction(transaction):

    card = transaction["card"]
    merchant = transaction["merchant"]
    amount = transaction["amount"]
    device = transaction["device_id"]

    print("\n-----------------------------------")
    print("Incoming transaction:", transaction)

    # ML fraud probability
    features = [[
    random.random(),
    amount / 10000,
    random.random(),
    random.random(),
    random.random()
] + [random.random() for _ in range(len(feature_names)-5)]]
    ml_score = model.predict_proba(features)[0][1]

    # Behavior risk
    behavior_score = behavior_risk(amount, avg_transaction_amount)

    # Device risk
    device_score = device_risk(device, known_devices)

    # Graph detection
    add_transaction(card, merchant)
    graph_score = graph_risk(card)

    # Final risk score
    risk = final_risk(ml_score, behavior_score, device_score, graph_score)

    # Decision
    result = decision(risk)

    # Explainability
    reasons = explain_transaction(
        amount,
        avg_transaction_amount,
        device_score,
        graph_score
    )

    print("Risk Score:", round(float(risk), 3))
    print("Initial Decision:", result)

    # =========================
    # HANDLE DECISION
    # =========================

    if result == "APPROVE":

        print("Transaction Approved")

    elif result == "CHALLENGE":

        print("⚠ Suspicious transaction detected")
        print("Reasons:", reasons)

        user_input = input("Approve transaction? (y/n): ")

        if user_input.lower() == "y":
            result = "APPROVE"
            print("Transaction manually approved")

        else:
            result = "BLOCK"
            print("Transaction rejected")

    elif result == "BLOCK":

        print("Transaction Blocked due to high fraud risk")
        print("Reasons:", reasons)

    return {
        "card": card,
        "merchant": merchant,
        "amount": amount,
        "risk_score": round(float(risk), 3),
        "decision": result,
        "explanation": reasons
    }


# =========================
# TEST MODE
# =========================

if __name__ == "__main__":

    transaction = {
        "card": "C1",
        "merchant": "Amazon",
        "amount": 9000,
        "device_id": "D5"
    }

    output = process_transaction(transaction)

    print("\nFinal Result:", output)