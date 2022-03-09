import { useState } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Worker, Viewer } from "@react-pdf-viewer/core"
import Alert from "../components/Alert";

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

  const dismissAlert = () => {
    setButtonClicked(true);
  }

  const checkResumeProcessing = () => {
    try {
      axios.get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } }).then((response) => {
        if (!response.data.success.resume_processing) {
          window.location.href = "profile/";
        } else {
          setTimeout(checkResumeProcessing, 2000);
        }
      });
    } catch (err) { }
  }

  const handleSubmission = () => {
    try {
      const form_data = new FormData();

      form_data.append("file", selectedFile);

      axios.post("/api/resume-upload", form_data, {
        headers: {
          "X-CSRFTOKEN": Cookies.get("csrftoken"),
          "Content-Disposition": `attachment; filename=${selectedFile.name}`,
          "Content-Type": "multipart/form-data"
        }
      }).then((response) => {
        setButtonClicked(true);
        checkResumeProcessing();
      }).catch(err => console.error(err));

    } catch (err) { }
  }

  return (
    <div>
      <h2>Upload resume in pdf format</h2>

      <div className="input-group">
        <label className="input-group-btn">
          <span className="btn btn-primary">
            Browse File <input type="file" name="file" onChange={changeHandler} accept="application/pdf" style={{ display: "none" }} multiple />
          </span>
          {selectedFile && <div>{selectedFileName}</div>}
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
            <button className="btn btn-primary" onClick={handleSubmission}>
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div>Choose a file to upload</div>
      )}
      {buttonClicked ? (
        <Alert
          type="success"
          message={<span><strong>Success!</strong> Your file has been uploaded. Please wait while your resume is being processed...</span>}
          spinner={true}
          handleDismiss={dismissAlert}
        />
      ) : (
        <div></div>
      )}
    </div>
  )
}

export default Upload
