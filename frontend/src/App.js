import logo from './logo.svg';
import './App.css';
import React, { useState, useRef } from 'react';
import { Upload, Video, AlertCircle, CheckCircle, Loader, Play, X, Download } from 'lucide-react';

function App() {
  return (
    <>
      return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              CNN-LSTM Accident Detection System
            </h1>
            <p className="text-red-100 mt-2">Upload video for AI-powered accident analysis (60 frames • 224x224 • Normalized)</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Upload Section */}
            <div className="bg-slate-700 rounded-xl p-6 border-2 border-dashed border-slate-600 hover:border-red-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-16 h-16 text-red-400 mb-4" />
                <p className="text-white text-lg font-semibold mb-2">
                  {videoFile ? videoFile.name : 'Click to upload video'}
                </p>
                <p className="text-slate-400 text-sm">Supports MP4, AVI, MOV, and more</p>
              </label>
            </div>

            {/* Video Preview */}
            {videoURL && (
              <div className="bg-slate-700 rounded-xl p-6">
                <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-6 h-6 text-red-400" />
                  Video Preview
                </h3>
                <video
                  ref={videoRef}
                  src={videoURL}
                  className="w-full rounded-lg"
                  controls
                  preload="metadata"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Action Buttons */}
            {videoFile && (
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={extractFrames}
                  disabled={processing || frames.length > 0}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {processing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Extracting Frames... {progress}%
                    </>
                  ) : frames.length > 0 ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      60 Frames Extracted (224x224)
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Extract 60 Frames
                    </>
                  )}
                </button>

                <button
                  onClick={sendToModel}
                  disabled={frames.length !== 60 || predicting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {predicting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Running CNN-LSTM Model...
                    </>
                  ) : (
                    'Run Detection'
                  )}
                </button>

                {frames.length === 60 && (
                  <button
                    onClick={downloadFramesAsJSON}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Export Frames
                  </button>
                )}

                <button
                  onClick={reset}
                  className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Reset
                </button>
              </div>
            )}

            {/* Processing Info */}
            {frames.length > 0 && (
              <div className="bg-blue-900 border border-blue-600 rounded-xl p-4">
                <h4 className="text-blue-200 font-semibold mb-2">Frame Processing Details:</h4>
                <ul className="text-blue-100 text-sm space-y-1">
                  <li>✓ Frames extracted: {frames.length}/60</li>
                  <li>✓ Resolution: 224x224 pixels (resized)</li>
                  <li>✓ Color space: RGB</li>
                  <li>✓ Normalization: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]</li>
                  <li>✓ Expected input shape: [1, 60, 3, 224, 224]</li>
                </ul>
              </div>
            )}

            {/* Frame Grid */}
            {frames.length > 0 && (
              <div className="bg-slate-700 rounded-xl p-6">
                <h3 className="text-white text-xl font-semibold mb-4">
                  Extracted Frames ({frames.length}/60)
                </h3>
                <div className="grid grid-cols-10 gap-2 max-h-96 overflow-y-auto">
                  {frames.map((frame, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-800 rounded overflow-hidden">
                      <img src={frame.dataURL} alt={`Frame ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 text-center">
                        {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className={`rounded-xl p-6 ${result.accident_detected ? 'bg-red-900 border-2 border-red-500' : 'bg-green-900 border-2 border-green-500'}`}>
                <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
                  {result.accident_detected ? (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-300" />
                      ⚠️ Accident Detected!
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-300" />
                      ✓ No Accident Detected
                    </>
                  )}
                </h3>
                <div className="space-y-2 text-white">
                  <p className="text-lg">
                    <span className="font-semibold">Model Confidence:</span> {(result.confidence * 100).toFixed(2)}%
                  </p>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold">Analyzed at:</span> {new Date(result.timestamp).toLocaleString()}
                  </p>
                  {result.demo_mode && (
                    <p className="text-yellow-300 text-sm mt-3">
                      ⚠️ Demo mode: Connect to your model server for real predictions
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Server Setup Instructions */}
            <div className="bg-slate-700 rounded-xl p-6 text-slate-300 text-sm">
              <h4 className="text-white font-semibold mb-3 text-lg">Backend Server Setup:</h4>
              <p className="mb-3">To connect this interface to your CNN-LSTM model, create a Flask server:</p>
              
              <div className="bg-slate-900 rounded p-4 mb-3 font-mono text-xs overflow-x-auto">
{`from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import numpy as np

app = Flask(__name__)
CORS(app)

# Load your trained model
model = CNN_LSTM(num_classes=2, hidden_dim=128)
model.load_state_dict(torch.load('model.pth'))
model.eval()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    frames = np.array(data['frames']).reshape(1, 60, 3, 224, 224)
    frames_tensor = torch.FloatTensor(frames).to(device)
    
    with torch.no_grad():
        output = model(frames_tensor)
        probs = torch.softmax(output, dim=1)
        predicted_class = torch.argmax(probs, dim=1).item()
        confidence = probs[0].cpu().numpy().tolist()
    
    return jsonify({
        'predicted_class': predicted_class,
        'confidence': confidence
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)`}
              </div>

              <p className="mb-2">Install dependencies:</p>
              <div className="bg-slate-900 rounded p-3 mb-3 font-mono text-xs">
                pip install flask flask-cors torch torchvision numpy
              </div>

              <p className="mb-2">Run the server:</p>
              <div className="bg-slate-900 rounded p-3 font-mono text-xs">
                python server.py
              </div>
            </div>

            {/* Usage Instructions */}
            <div className="bg-slate-700 rounded-xl p-6 text-slate-300 text-sm">
              <h4 className="text-white font-semibold mb-2">How to use:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload a video file using the upload area</li>
                <li>Click "Extract 60 Frames" to segment the video into 60 frames at 224x224 resolution</li>
                <li>Click "Run Detection" to send normalized frames to your CNN-LSTM model</li>
                <li>View the detection results (Class 0: No Accident, Class 1: Accident)</li>
                <li>Optional: Export frames as JSON for offline processing</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div> 
    </>);
}

export default App;
