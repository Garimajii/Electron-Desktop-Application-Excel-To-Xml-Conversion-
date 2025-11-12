import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExcelToXmlConverter.css';

function ExcelToXmlConverter() {
  const [file, setFile] = useState(null);
  const [xmlContent, setXmlContent] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [theme, setTheme] = useState("light");
  const [serverResponse, setServerResponse] = useState(""); 

  
  const BACKEND_CONVERT_URL = "http://localhost:8080/api/convert/excel-to-xml";
  const BACKEND_UPLOAD_URL = "http://localhost:8080/api/convert/upload-xml";

  useEffect(() => {
    const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (e) => setTheme(e.matches ? "dark" : "light");

    setTheme(darkQuery.matches ? "dark" : "light");
    darkQuery.addEventListener("change", updateTheme);

    return () => darkQuery.removeEventListener("change", updateTheme);
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setXmlContent("");
    setStatus("");
    setSuccess(false);
    setUploadProgress(0);
    setServerResponse("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setXmlContent("");
      setStatus("");
      setSuccess(false);
      setUploadProgress(0);
      setServerResponse("");
    }
  };

  
  const handleConvert = async () => {
    if (!file) {
      setStatus("❗ Please upload an Excel file first!");
      setSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setStatus("Uploading & converting...");
      setSuccess(false);
      setUploadProgress(0);

      const response = await axios.post(BACKEND_CONVERT_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "text",
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setXmlContent(response.data);
      setStatus("✅ Conversion successful!");
      setSuccess(true);
    } catch (error) {
      console.error("Conversion failed:", error);
      setStatus("❌ Conversion failed! Check console.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  
  const handleUploadToServer = async () => {
    if (!xmlContent) {
      setStatus("❗ No XML content to upload!");
      return;
    }

    try {
      setLoading(true);
      setStatus("Uploading XML to external server...");
      setSuccess(false);
      setUploadProgress(0);
      setServerResponse("");

      const response = await axios.post(BACKEND_UPLOAD_URL, xmlContent, {
        headers: { "Content-Type": "text/xml" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setStatus("✅ XML successfully uploaded to the external server!");
      setSuccess(true);
      setServerResponse(response.data); 
    } catch (error) {
    console.error("Upload failed:", error);
      setStatus("❌ Upload failed! Check console.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!xmlContent) return;

    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "converted.xml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    setStatus("💾 XML downloaded successfully!");
  };

  return (
    <div className={`excel-container ${theme}`}>
      <div className="converter-card">
        <h2>📄 Excel to XML Converter</h2>
        <p>Drag & drop your Excel file or click to select</p>

        <div
          className={`drag-drop-area ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {file ? `📁 ${file.name}` : "Drag & drop file here or click to select"}
          <input
            type="file"
            accept=".xls,.xlsx"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <button onClick={handleConvert} disabled={loading} className="convert-btn">
          {loading ? "Converting..." : "Convert"}
        </button>

        {xmlContent && (
          <button
            onClick={handleUploadToServer}
            disabled={loading}
            className="upload-btn"
          >
            {loading ? "Uploading..." : "Upload to Server"}
          </button>
        )}

        {loading && (
          <div className="progress-wrapper">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        {xmlContent && (
          <button onClick={handleDownload} className="download-btn">
            Download XML
          </button>
        )}

        {status && (
          <p className="status-msg">
            {status}
            {success && <span className="checkmark"></span>}
          </p>
        )}

        {xmlContent && <pre className="xml-output">{xmlContent}</pre>}

        {serverResponse && (
          <div className="server-response">
            <h3>🧾 Server Response</h3>
            <pre>{serverResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExcelToXmlConverter;
