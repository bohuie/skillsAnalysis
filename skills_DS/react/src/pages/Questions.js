import { Fragment, useState, useEffect } from "react"
import axios from "axios"
import Cookies from "js-cookie"
import Alert from "../components/Alert";

const Questions = props => {
  const [age, setAge] = useState(null)
  const [gender, setGender] = useState(null)
  const [yearOfStudy, setYearOfStudy] = useState(null)

  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: ""
  });
  const dismissAlert = () => {
    setAlert({ visible: false })
  }

  const [received, setReceived] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = (event) => {
    event.preventDefault()
    axios
      .post("/api/answers", { age, gender, yearOfStudy }, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then((response) => {
        setAlert({
          visible: true,
          type: "success",
          message: <span><strong>Success!</strong> Thank you for answering the questions. Redirecting you to your profile...</span>
        });
        setTimeout(() => {
          window.location.href = "profile/";
        }, 1500);
      })
      .catch((error) => {
        setAlert({
          visible: true,
          type: "danger",
          message: <span><strong>Error!</strong> Something went wrong. Please try again later.</span>
        });
      })
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
        <form onSubmit={handleSubmit}>
          <table className="table">
            <tbody>
              <tr className="table-borderless">
                <td scope="col" colSpan="2">
                  <h3>
                    Welcome, please answer some questions.
                  </h3>
                </td>
              </tr>
              <tr>
                <td>What is your age?</td>
                <td>
                  <input type="text" id="q1" autoComplete="off" className="form-control" onChange={e => setAge(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td>What is your gender?</td>
                <td>
                  <input type="text" id="q2" autoComplete="off" className="form-control" onChange={e => setGender(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td>What is your year of study?</td>
                <td>
                  <input type="text" id="q3" autoComplete="off" className="form-control" onChange={e => setYearOfStudy(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan={2}>
                  <button className="btn btn-primary w-100" type="submit">
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </Fragment>
  )
}

export default Questions
