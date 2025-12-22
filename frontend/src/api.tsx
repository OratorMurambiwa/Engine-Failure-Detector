const API_BASE = "http://localhost:8000";

export interface PredictionResult {
  rul: number;
  status: "healthy" | "monitor" | "critical";
  color: "green" | "yellow" | "red";
  cycles_analyzed: number;
  rows_received: number;
  last_cycle: number | null;
}

export async function predictRUL(file: File): Promise<PredictionResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Prediction failed");
  }

  return response.json();
}