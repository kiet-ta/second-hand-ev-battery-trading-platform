from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)

# Load saved files
model = joblib.load('xgboost_model.pkl')
encoders = joblib.load('label_encoders.pkl')
training_columns = joblib.load('training_columns.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    input_df = pd.DataFrame([data])

    # Apply preprocessing steps
    input_df['HorsePower_Torque'] = input_df['HorsePower'] * input_df['Torque']
    input_df['HorsePower_Accel_Efficiency'] = input_df['HorsePower'] * input_df['Accel_Efficiency']

    for col, encoder in encoders.items():
        try:
            # Use pre-fit encoder to transform
            input_df[col] = encoder.transform(input_df[col].astype(str))
        except:
             # If a new value is encountered that the encoder does not know, assign it to -1.
            input_df[col] = -1

    input_df = input_df.reindex(columns=training_columns, fill_value=0)
    
    # Predict and return results
    log_price_prediction = model.predict(input_df)
    price_prediction = np.expm1(log_price_prediction)

    return jsonify({'predicted_price': price_prediction[0]})

if __name__ == '__main__':
    # Run AI service on port 5000
    app.run(host='0.0.0.0', port=5000)