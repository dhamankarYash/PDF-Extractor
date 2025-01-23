import React, { useState, useCallback } from "react"
import axios from "axios"
import { useDropzone } from "react-dropzone"
import "./App.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const App = () => {
  const [file, setFile] = useState(null)
  const [extractedData, setExtractedData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0])
    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: "application/pdf" })

  const handleUpload = async () => {
    if (!file) {
      toast.warning("Please select a file first!", {
        position: "top-right",
        autoClose: 1200,
        style: {
          backgroundColor: '#fff',
          color: '#000',
          fontSize: '18px',
          padding: '16px',
          borderRadius: '10px'
        }
      });
      return
    }

    setIsLoading(true)
    setError(null)
    setExtractedData(null)
    setUploadStatus("Uploading...")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      setExtractedData(res.data)
      if (res) {
        toast.success("Data extracted successfully.", {
          position: "top-right",
          autoClose: 1200,
          style: {
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '18px',
            padding: '16px',
            borderRadius: '10px'
          }
        })
      }
    } catch (error) {
      console.error(error)
      setError(error.response?.data?.error || "Failed to upload the file. Please try again.")
      setUploadStatus("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    toast.success("File removed successfully.", {
      position: "top-right",
      autoClose: 1200,
      style: {
        backgroundColor: '#fff',
        color: '#000',
        fontSize: '18px',
        padding: '16px',
        borderRadius: '10px'
      }
    })
  }
  const handleUploadAgain = () => {
    setFile(null)
    setExtractedData(null)
    setError(null)
    setUploadStatus("")
  }

  return (
    <><ToastContainer 
        hideProgressBar={false}
        newestOnTop
        closeButton={false}
        draggable
        pauseOnHover
      />
      <div className="container">
      <h1>PDF Extractor</h1>
      {!extractedData ? (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
          <input {...getInputProps()} />
          {file ? (
            <>
              <p style={{ color: "#6B85AA" }}>{file.name}</p>
            </>
          ) : (
            <p style={{ color: "#9599A4" }}><b>Drag & Drop</b> a PDF file here, or <b>Click</b> to select one</p>
          )}
        </div>
      ) : null}

      {file && !extractedData ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={handleUpload} disabled={isLoading}>
            {uploadStatus || "Upload"}
          </button>
          <button onClick={handleRemove} style={{background:"#024D80", marginLeft:"8px"}}>
            Remove File
          </button>
        </div>
      ) : !extractedData ? (
        <div style={{ textAlign: "center" }}>
          <button onClick={handleUpload} disabled={isLoading}>
            {uploadStatus || "Upload"}
          </button>
        </div>
      ) : (null)}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      {extractedData && (
        <div className="extracted-data">
          <h3>Extracted Data:</h3>
          <form>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" value={extractedData.name} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone:</label>
              <input type="text" id="phone" value={extractedData.phone} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <input type="text" id="address" value={extractedData.address} readOnly />
            </div>
            <div className="form-group">
              <label htmlFor="role">Role:</label>
              <input type="text" id="role" value={extractedData.role} readOnly />
            </div>
          </form>
          <div style={{ textAlign: "center" }}>
            <button onClick={handleUploadAgain}>Upload Again</button>
          </div>
        </div>
      )}
    </div></>
  )
}

export default App

