import { useState, Fragment } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import { Document, Page, pdfjs } from 'react-pdf'
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
import Alert from "../components/Alert";

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState()
  const [selectedFileName, setSelectedFileName] = useState("")
  const [pdfFile, setPdfFile] = useState(null)
  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: ""
  });

  const dismissAlert = () => {
    setAlert({ visible: false })
  }

  const changeHandler = event => {
    setSelectedFile(event.target.files[0])
    setSelectedFileName(event.target.files[0].name)
    let reader = new FileReader()
    reader.readAsDataURL(event.target.files[0])
    reader.onloadend = e => {
      const data = e.target.result
      setPdfFile(data)
    }
  }

  const checkResumeProcessing = () => {
    axios.get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then((response) => {
        if (!response.data.profile.resume_processing) {
          window.location.href = "profile/";
        } else {
          setTimeout(checkResumeProcessing, 2000);
        }
      }).catch((error) => {
        console.log(error);
        window.location.href = "profile/";
      });
  }

  const handleSubmission = () => {
    const form_data = new FormData();

    form_data.append("file", selectedFile);

    axios.post("/api/resume-upload", form_data, {
      headers: {
        "X-CSRFTOKEN": Cookies.get("csrftoken"),
        "Content-Disposition": `attachment; filename=${selectedFile.name}`,
        "Content-Type": "multipart/form-data"
      }
    }).then((response) => {
      console.log(response);
      setAlert({
        visible: true,
        type: "success",
        message: <span><strong>Success!</strong> Your file has been uploaded. Please wait while your resume is being processed...&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>
      });
      checkResumeProcessing();
    }).catch((error) => {
      console.error(error);
      setAlert({
        visible: true,
        type: "danger",
        message: <span><strong>Error!</strong> {
          error.response ? (error.response.data.message) : (error.message)
        }</span>
      });
    });
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
              <td colSpan={2}><h3 data-testid="upload-header">Upload your resume in pdf format</h3></td>
            </tr>
            <tr>
              <td>
                <div className="input-group">
                  <label className="input-group-btn w-100">
                    <span className="btn btn-primary w-100" data-testid="browse-header">
                      Browse File <input type="file" name="file" data-testid="file-input" onChange={changeHandler} accept="application/pdf" style={{ display: "none" }} multiple />
                    </span>
                  </label>
                </div>
              </td>
              {selectedFile && <td><b data-testid="file-name">{selectedFileName}</b></td>}
            </tr>
          </tbody>
        </table>
      </div>

      {pdfFile && (
        <div className="shadow p-3 mb-5 bg-white rounded">
          <div>
            <button className="btn btn-success w-100" onClick={handleSubmission}>
              Submit
            </button>
          </div>
          <hr className="m-4" />
          <Document file={pdfFile} className="d-flex justify-content-center"><Page pageNumber={1} scale={1.5}/></Document>
        </div>
      )}
    </Fragment>
  )
}

export default Upload
