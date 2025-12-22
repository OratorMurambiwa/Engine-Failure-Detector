import torch
import torch.nn as nn
import pandas as pd
import json
import os

# same GRU model from my training code
class GRURULModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=1):
        super().__init__()
        self.gru = nn.GRU(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True
        )
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        gru_out, h_n = self.gru(x)
        last_hidden = h_n[-1]
        out = self.fc(last_hidden)
        return out.squeeze(1)


class RULPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.feature_cols = None
        self.feature_means = None
        self.feature_stds_safe = None
        self.seq_len = None
        
    def load_model(self, model_path, preproc_path):
        # load preprocessing stats
        with open(preproc_path, "r") as f:
            preproc_config = json.load(f)
        
        self.feature_cols = preproc_config["feature_cols"]
        self.feature_means = pd.Series(preproc_config["feature_means"])
        self.feature_stds_safe = pd.Series(preproc_config["feature_stds_safe"])
        self.seq_len = preproc_config["seq_len"]
        
        # load model
        input_size = len(self.feature_cols)
        self.model = GRURULModel(input_size=input_size, hidden_size=64, num_layers=1)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
        
        print(f"Model loaded on {self.device}")
    
    def predict(self, df):
        # need exactly seq_len rows (30 cycles)
        if len(df) < self.seq_len:
            raise ValueError(f"Need at least {self.seq_len} rows, got {len(df)}")
        
        # take last 30 cycles
        df_window = df.iloc[-self.seq_len:].copy()
        
        # normalize using training stats
        df_window[self.feature_cols] = (
            df_window[self.feature_cols] - self.feature_means[self.feature_cols]
        ) / self.feature_stds_safe[self.feature_cols]
        
        # convert to tensor
        x = torch.tensor(
            df_window[self.feature_cols].values,
            dtype=torch.float32
        ).unsqueeze(0).to(self.device)
        
        # predict
        with torch.no_grad():
            pred_rul = self.model(x).item()
        
        # get health status
        if pred_rul > 100:
            status = "healthy"
            color = "green"
        elif pred_rul > 50:
            status = "monitor"
            color = "yellow"
        else:
            status = "critical"
            color = "red"
        
        return {
            "rul": round(pred_rul, 2),
            "status": status,
            "color": color,
            "cycles_analyzed": self.seq_len
        }


# singleton instance
predictor = RULPredictor()

# load model on startup
model_dir = os.path.join(os.path.dirname(__file__), "..", "models")
model_path = os.path.join(model_dir, "best_gru_fd001.pt")
preproc_path = os.path.join(model_dir, "preprocessing_stats_fd001.json")

predictor.load_model(model_path, preproc_path)