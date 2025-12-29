# Beamline Failure Detector (RUL Predictor)

A full-stack web application for predicting the Remaining Useful Life (RUL) of engines using machine learning. This system analyzes sensor data from aircraft engines to estimate how many more cycles an engine can operate before requiring maintenance.

## Features

- **Machine Learning Prediction**: Uses a trained GRU (Gated Recurrent Unit) neural network model for accurate RUL prediction
- **Web Interface**: Clean, user-friendly React frontend for easy data upload and result visualization
- **REST API**: FastAPI backend providing robust prediction endpoints
- **Real-time Health Assessment**: Provides health status indicators (healthy, monitor, critical) with color coding
- **Data Validation**: Ensures uploaded CSV files contain required sensor columns
- **CORS Support**: Configured for seamless frontend-backend communication

## Tech Stack

### Backend
- **FastAPI**: High-performance web framework for building APIs
- **PyTorch**: Deep learning framework for the GRU model
- **Pandas**: Data manipulation and analysis
- **Uvicorn**: ASGI server for running the FastAPI app

### Frontend
- **React**: JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **TypeScript**: Typed JavaScript for better code quality
- **Lucide React**: Icon library for UI elements
- **Recharts**: Chart library for data visualization

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Start both servers** (backend and frontend) as described above.

2. **Open the frontend** in your browser at `http://localhost:5173`.

3. **Upload a CSV file** containing engine sensor data using the upload interface.

4. **Click "Predict RUL"** to get the prediction results.

5. **View results** including:
   - Predicted Remaining Useful Life (in cycles)
   - Health status (healthy/monitor/critical)
   - Number of cycles analyzed
   - Color-coded status indicator

## API Documentation

### Endpoints

#### GET /
Returns a welcome message.
```json
{
  "message": "RUL Prediction API is running"
}
```

#### GET /health
Health check endpoint.
```json
{
  "status": "healthy"
}
```

#### POST /predict
Predicts RUL from uploaded CSV data.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: CSV file upload

**Response:**
```json
{
  "rul": 85.67,
  "status": "monitor",
  "color": "yellow",
  "cycles_analyzed": 30,
  "rows_received": 45,
  "last_cycle": 192
}
```

**Error Responses:**
- 400: Invalid file format or missing required columns
- 500: Server error during processing

## CSV File Format

The system expects CSV files containing sensor data from turbofan engines. The data should be in chronological order for a single engine, with each row representing one operational cycle.

### Required Columns

The CSV file **must** contain the following 24 columns (in any order):

1. `op_setting_1` - Operational setting 1 (float)
2. `op_setting_2` - Operational setting 2 (float)
3. `op_setting_3` - Operational setting 3 (float)
4. `sensor_1` to `sensor_21` - Sensor measurements (floats)

### Optional Columns

- `engine_id` - Engine identifier (integer) - Used for reference but not required for prediction
- `cycle` - Cycle number (integer) - Used for reference but not required for prediction

### Data Requirements

- **Minimum rows**: 30 cycles (the model analyzes the last 30 cycles for prediction)
- **Data type**: All sensor values should be numeric (float/integer)
- **Missing values**: Not allowed - all required columns must have valid numeric values
- **Order**: Data should be sorted by cycle number (ascending)

### Example CSV Structure

```csv
engine_id,cycle,op_setting_1,op_setting_2,op_setting_3,sensor_1,sensor_2,sensor_3,sensor_4,sensor_5,sensor_6,sensor_7,sensor_8,sensor_9,sensor_10,sensor_11,sensor_12,sensor_13,sensor_14,sensor_15,sensor_16,sensor_17,sensor_18,sensor_19,sensor_20,sensor_21
1,1,-0.0007,-0.0004,100.0,518.67,641.82,1589.7,1400.6,14.62,21.61,554.36,2388.06,9046.19,1.3,47.47,521.66,2388.02,8138.62,8.4195,0.03,392,2388,100.0,39.06,23.419
1,2,0.0019,-0.0003,100.0,518.67,642.15,1591.82,1403.14,14.62,21.61,553.75,2388.04,9044.07,1.3,47.49,522.28,2388.07,8131.49,8.4318,0.03,392,2388,100.0,39.0,23.4236
...
```

### Sample Data

A template CSV file is provided in `backend/models/template_engine_data.csv` with sample data for testing purposes.

## Model Details

- **Algorithm**: Gated Recurrent Unit (GRU) Neural Network
- **Input**: Last 30 operational cycles (24 sensor features each)
- **Output**: Predicted Remaining Useful Life in cycles
- **Training Data**: NASA C-MAPSS FD001 dataset
- **Preprocessing**: Z-score normalization using training statistics

### Health Status Thresholds
- **Healthy**: RUL > 100 cycles
- **Monitor**: 50 < RUL ≤ 100 cycles  
- **Critical**: RUL ≤ 50 cycles

## Project Structure

```
RUL/
├── app.py                 # Root application entry point
├── backend/
│   ├── requirements.txt   # Python dependencies
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI application
│   │   ├── inference.py   # ML model and prediction logic
│   │   └── __pycache__/
│   └── models/
│       ├── best_gru_fd001.pt              # Trained PyTorch model
│       ├── preprocessing_stats_fd001.json # Normalization statistics
│       ├── template_engine_data.csv       # Sample input data
│       └── train_FD003.txt                # Training data reference
└── frontend/
    ├── package.json       # Node.js dependencies
    ├── vite.config.ts     # Vite configuration
    ├── index.html         # HTML template
    ├── src/
    │   ├── App.tsx        # Main React component
    │   ├── api.tsx        # API client functions
    │   ├── index.css      # Global styles
    │   └── main.tsx       # React entry point
    └── public/
        └── vite.svg       # Vite logo
```

## Contributing

1. Fork the repository
2. Create a feature branch 
3. Commit your changes 

## License

This project is licensed under the MIT License 

## Acknowledgments

- NASA for providing the C-MAPSS turbofan engine degradation dataset

Juptyer Notebook

- https://colab.research.google.com/drive/161Bq63a0_E4ULPJHu0qZcdhSASQbPAJC?usp=sharing

