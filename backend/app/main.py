from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from app.inference import predictor

app = FastAPI(title="RUL Prediction API")

# allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "RUL Prediction API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/predict")
async def predict_rul(file: UploadFile = File(...)):
    # make sure it's a CSV
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # read CSV
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # check if we have the right columns
        required_cols = predictor.feature_cols
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing columns: {missing_cols}"
            )
        
        # get prediction
        result = predictor.predict(df)
        
        # add some extra info
        result["rows_received"] = len(df)
        result["last_cycle"] = int(df["cycle"].max()) if "cycle" in df.columns else None
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)