from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np
from model import CNN_LSTM

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load your trained model
print("Loading model...")
model = CNN_LSTM(num_classes=2, hidden_dim=128)
model.load_state_dict(torch.load('models/model.pth', map_location='cpu'))
model.eval()

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)
print(f"Model loaded on {device}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'device': str(device)})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        frames = np.array(data['frames'], dtype=np.float32)
        
        # Reshape to [1, 60, 3, 224, 224]
        frames = frames.reshape(1, 60, 3, 224, 224)
        frames_tensor = torch.FloatTensor(frames).to(device)
        
        with torch.no_grad():
            output = model(frames_tensor)
            probs = torch.softmax(output, dim=1)
            predicted_class = torch.argmax(probs, dim=1).item()
            confidence = probs[0].cpu().numpy().tolist()
        
        return jsonify({
            'predicted_class': int(predicted_class),
            'confidence': confidence,
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)