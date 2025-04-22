from flask import Flask, request, jsonify
from flask_cors import CORS
import serial
import requests
import json
import threading

app = Flask(__name__)
CORS(app)

running_data = []
user_profile = {"weight": 70, "height": 1.7}  # Default: 70kg, 1.7m

ser = serial.Serial('COM4', 9600)

def read_serial():
    while True:
        line = ser.readline().decode().strip()
        try:
            data = json.loads(line)
            running_data.append(data)
            requests.post("http://localhost:5000/update", json=data)
        except:
            pass

threading.Thread(target=read_serial, daemon=True).start()

@app.route("/update", methods=["POST"])
def update_data():
    data = request.get_json()
    running_data.append(data)
    return jsonify({"status": "received"}), 200

@app.route("/data", methods=["GET"])
def get_data():
    return jsonify(running_data)

@app.route("/stats", methods=["GET"])
def get_stats():
    total_distance = sum(d["distance"] for d in running_data) if running_data else 0
    total_time = sum(d["time"] for d in running_data) / 3600 if running_data else 0  # Hours
    calories = 7.0 * user_profile["weight"] * total_time  # MET = 7.0
    avg_heart_rate = sum(d["heartRate"] for d in running_data) / len(running_data) if running_data else 0
    bmi = user_profile["weight"] / (user_profile["height"] ** 2)
    
    diet_plan = ""
    exercise_plan = ""
    if bmi < 18.5:
        diet_plan = "Eat high-protein foods (eggs, chicken, nuts). Aim for 2500-3000 kcal/day."
        exercise_plan = "Strength training 3x/week, light cardio."
    elif 18.5 <= bmi < 25:
        diet_plan = "Balanced diet: 40% carbs, 30% protein, 30% fat. ~2000 kcal/day."
        exercise_plan = "Mix of cardio and strength, 4-5x/week."
    else:
        diet_plan = "Low-carb, high-fiber diet. Aim for 1500-1800 kcal/day."
        exercise_plan = "Cardio 5x/week, strength training 2x/week."

    return jsonify({
        "total_distance": total_distance,
        "total_time": total_time * 3600,  # Seconds
        "calories": calories,
        "avg_heart_rate": avg_heart_rate,
        "bmi": bmi,
        "diet_plan": diet_plan,
        "exercise_plan": exercise_plan
    })

@app.route("/profile", methods=["POST"])
def update_profile():
    data = request.get_json()
    user_profile["weight"] = data.get("weight", user_profile["weight"])
    user_profile["height"] = data.get("height", user_profile["height"])
    return jsonify({"status": "profile updated"})

if __name__ == "__main__":
    app.run(debug=True)