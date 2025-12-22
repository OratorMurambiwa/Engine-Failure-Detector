import { useState } from "react";
import { Upload, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { predictRUL, PredictionResult } from "./api";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handlePredict = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const prediction = await predictRUL(file);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Remaining Useful Life Predictor</h1>
        <p style={styles.subtitle}>
          Upload sensor data to estimate 
        </p>

        {/* Upload Section */}
        <div style={styles.uploadSection}>
          <label htmlFor="file-upload" style={styles.uploadLabel}>
            <Upload size={24} />
            <span>{file ? file.name : "Choose CSV File"}</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={styles.fileInput}
          />

          <button
            onClick={handlePredict}
            disabled={!file || loading}
            style={{
              ...styles.button,
              opacity: !file || loading ? 0.5 : 1,
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Predict RUL"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={styles.resultsSection}>
            <div
              style={{
                ...styles.statusCard,
                borderColor: getStatusColor(result.color),
                backgroundColor: getStatusBg(result.color),
              }}
            >
              <div style={styles.statusHeader}>
                {getStatusIcon(result.status)}
                <span style={styles.statusText}>
                  {result.status.toUpperCase()}
                </span>
              </div>

              <div style={styles.rulDisplay}>
                <span style={styles.rulNumber}>{result.rul}</span>
                <span style={styles.rulLabel}>cycles remaining</span>
              </div>

              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${Math.min((result.rul / 200) * 100, 100)}%`,
                    backgroundColor: getStatusColor(result.color),
                  }}
                />
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Cycles Analyzed</span>
                <span style={styles.infoValue}>{result.cycles_analyzed}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Total Rows</span>
                <span style={styles.infoValue}>{result.rows_received}</span>
              </div>
              {result.last_cycle && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Last Cycle</span>
                  <span style={styles.infoValue}>{result.last_cycle}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer style={styles.footer}>
        <p style={styles.footerSub}>
          Model trained on NASA CMAPSS turbofan dataset
        </p>
      </footer>
    </div>
  );
}

// helpers for status styling
function getStatusColor(color: string) {
  const colors = {
    green: "#10b981",
    yellow: "#f59e0b",
    red: "#ef4444",
  };
  return colors[color as keyof typeof colors];
}

function getStatusBg(color: string) {
  const colors = {
    green: "#d1fae5",
    yellow: "#fef3c7",
    red: "#fee2e2",
  };
  return colors[color as keyof typeof colors];
}

function getStatusIcon(status: string) {
  if (status === "healthy")
    return <CheckCircle size={32} color="#10b981" />;
  if (status === "monitor")
    return <AlertTriangle size={32} color="#f59e0b" />;
  return <AlertCircle size={32} color="#ef4444" />;
}

// styling
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "600px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#1f2937",
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: "32px",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "24px",
  },
  uploadLabel: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    backgroundColor: "#f9fafb",
  },
  fileInput: {
    display: "none",
  },
  button: {
    padding: "12px 24px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#fee2e2",
    border: "1px solid #ef4444",
    borderRadius: "8px",
    color: "#991b1b",
    marginBottom: "24px",
  },
  resultsSection: {
    marginTop: "32px",
  },
  statusCard: {
    padding: "24px",
    borderRadius: "12px",
    border: "3px solid",
    marginBottom: "24px",
  },
  statusHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  statusText: {
    fontSize: "18px",
    fontWeight: "bold",
  },
  rulDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "16px",
  },
  rulNumber: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  rulLabel: {
    fontSize: "14px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  progressBar: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e5e7eb",
    borderRadius: "6px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.5s ease",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
  },
  infoLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
  },
  footer: {
    marginTop: "48px",
    textAlign: "center",
    color: "white",
  },
  footerSub: {
    marginTop: "8px",
    opacity: 0.8,
    fontSize: "14px",
  },
};

export default App;