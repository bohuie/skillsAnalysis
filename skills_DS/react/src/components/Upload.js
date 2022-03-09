import {useState} from "react"
import axios from "axios"
import Cookies from "js-cookie"
import {Worker, Viewer} from "@react-pdf-viewer/core"

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const [PDFFile, setPDFFile] = useState(null)
  const [buttonClicked, setButtonClicked] = useState(false)

  const changeHandler = event => {
    setSelectedFile(event.target.files[0])
    setSelectedFileName(event.target.files[0].name)
    let reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])
    reader.onloadend = e => {
      const data = e.target.result
      setPDFFile(data)
    }
  }

  const handleSubmission = () => {
    try {
      const form_data = new FormData()

      form_data.append("file", selectedFile)

      axios.post("/api/fileupload", form_data, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken"), "Content-Disposition": `attachment; filename=${selectedFile.name}`, "Content-Type": "multipart/form-data"}}).catch()

      setButtonClicked(true)
    } catch (err) {}
  }

  return (
    <div>
      <h2 data-testid="upload-header">Upload resume in pdf format</h2>

      <div data-testid="upload-button" className="input-group">
        <label className="input-group-btn">
          <span data-testid="browse-header" className="btn btn-primary">
            Browse File<input data-testid="file-input" type="file" name="file" onChange={changeHandler} accept="application/pdf" style={{display: "none"}} multiple />
          </span>
          {selectedFile && <div data-testid="file-name">{selectedFileName}</div>}
        </label>
      </div>

      {PDFFile ? (
        <div>
          <div
            style={{
              border: "1px solid rgba(0, 0, 0, 0.3)"
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
              <Viewer fileUrl={PDFFile} />
            </Worker>
          </div>
          <div
            style={{
              marginTop: "10px"
            }}
          >
            <button data-testid="submit-button" className="btn btn-primary" onClick={handleSubmission}>
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div>Choose a file to upload</div>
      )}
      {buttonClicked ? (
        <div
          className="wrapper"
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            zIndex: "99"
          }}
        >
          <div className="alert alert-success alert-dismissible" style={{textAlign: "center"}}>
            <button
              type="button"
              className="close"
              onClick={() => {
                setButtonClicked(false)
              }}
            >
              &times;
            </button>
            <strong data-testid="success-message">Success!</strong> Your file has been uploaded.
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Upload
