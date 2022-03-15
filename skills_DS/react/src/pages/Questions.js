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

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log({ age, gender, yearOfStudy });
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
                  <h3 data-testid="welcome-header">
                    Welcome, please answer some questions.
                  </h3>
                </td>
              </tr>
              <tr>
                <td data-testid="age">What is your age?</td>
                <td>
                  <input required type="number" id="q1" min="1" max="99" autoComplete="off" className="form-control" onChange={e => setAge(e.target.value)} />
                </td>
              </tr>
              <tr>
                <td data-testid="gender">What is your gender?</td>
                <td>
                  <select required className="form-control" id="q2" onChange={e => setGender(e.target.value)} defaultValue={''}>
                    <option disabled hidden value="" > select an option </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Pref">Prefer not to say</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td data-testid="year">What is your year of study?</td>
                <td>
                  <select required className="form-control" id="q3" onChange={e => setYearOfStudy(e.target.value)} defaultValue={''}>
                    <option disabled hidden value="" > select an option </option>
                    <option value="One">1</option>
                    <option value="Two">2</option>
                    <option value="Three">3</option>
                    <option value="Four">4</option>
                    <option value="Five">5</option>
                    <option value="Fivep">5+</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td scope="col" colSpan={2}>
                  <button data-testid="submit-button" className="btn btn-primary w-100" type="submit">
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
