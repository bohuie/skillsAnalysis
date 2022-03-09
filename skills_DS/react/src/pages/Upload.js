import { useState, Fragment } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Worker, Viewer } from "@react-pdf-viewer/core"
import Alert from "../components/Alert";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const [PDFFile, setPDFFile] = useState(null)
  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: ""
  });

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
    setAlert({ visible: false })
  }

  const checkResumeProcessing = () => {
    try {
      axios.get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } }).then((response) => {
        if (!response.data.profile.resume_processing) {
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
        setAlert({
          visible: true,
          type: "success",
          message: <span><strong>Success!</strong> Your file has been uploaded. Please wait while your resume is being processed...&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>
        });
        checkResumeProcessing();
      }).catch(err => console.error(err));

    } catch (err) { }
  }

  return (
    <Fragment>
      <Alert
        visible={alert.visible}
        type={alert.type}
        message={alert.message}
        handleDismiss={dismissAlert}
      />

      <div className="shadow p-3 mt-5 mb-3 bg-white rounded">
        <table className="table m-0">
          <tbody>
            <tr className="table-borderless">
              <td colSpan={2}><h3>Upload your resume in pdf format</h3></td>
            </tr>
            <tr>
              <td>
                <div className="input-group">
                  <label className="input-group-btn w-100">
                    <span className="btn btn-primary w-100">
                      Browse File <input type="file" name="file" onChange={changeHandler} accept="application/pdf" style={{ display: "none" }} multiple />
                    </span>
                  </label>
                </div>
              </td>
              {selectedFile && <td><b>{selectedFileName}</b></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {PDFFile && (
        <div className="shadow p-3 mb-5 bg-white rounded">
          <div>
            <button className="btn btn-success w-100" onClick={handleSubmission}>
              Submit
            </button>
          </div>
          <hr class="m-4" />
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.12.313/build/pdf.worker.min.js">
            <Viewer fileUrl={PDFFile} />
          </Worker>
        </div>
      )}
    </Fragment>
  )
}

export default Upload
