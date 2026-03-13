from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

approved_count = 12911
blocked_count = 406
challenge_count = 160


@app.route("/")
def dashboard():
    return render_template("dashboard.html")


@app.route("/feed")
def feed():

    merchants = ["Stripe","Binance","PayPal","Adyen"]

    data = []

    for i in range(10):

        prob = random.uniform(0,1)

        data.append({
            "id": i,
            "amount": round(random.uniform(100,5000),2),
            "merchant": random.choice(merchants),
            "probability": prob
        })

    return jsonify(data)


@app.route("/approve/<int:tid>")
def approve(tid):

    global approved_count, challenge_count

    approved_count += 1
    challenge_count -= 1

    if challenge_count < 0:
        challenge_count = 0

    return jsonify({
        "approved": approved_count,
        "challenges": challenge_count
    })


@app.route("/block/<int:tid>")
def block(tid):

    global blocked_count, challenge_count

    blocked_count += 1
    challenge_count -= 1

    if challenge_count < 0:
        challenge_count = 0

    return jsonify({
        "blocked": blocked_count,
        "challenges": challenge_count
    })


@app.route("/stats")
def stats():

    return jsonify({
        "approved": approved_count,
        "blocked": blocked_count,
        "challenges": challenge_count
    })


if __name__ == "__main__":
    app.run(debug=True)