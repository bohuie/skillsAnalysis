import {Fragment, useState, useEffect} from "react"
import axios from "axios"
import Cookies from "js-cookie"

const Questions = props => {
  const [age, setAge] = useState(null)
  const [gender, setGender] = useState(null)
  const [yearOfStudy, setYearOfStudy] = useState(null)

  const [received, setReceived] = useState(false)
  const [error, setError] = useState(null)

  const submit = e => {
    e.preventDefault()
    axios
      .post("/api/answers", {age, gender, yearOfStudy}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(res => {
        console.log(res.data)
        setReceived(true)
      })
      .catch(err => {
        console.error(err, err?.response, err?.response?.data)
        setError("bad request")
      })
  }

  return (
    <Fragment>
      {error ? (
        <h1 data-testid="error">{error}</h1>
      ) : received ? (
        <h1 data-testid="submit-header">Thank you for answering the questions!</h1>
      ) : (
        <Fragment>
          <h1 data-testid="welcome-header">Welcome, please answer some questions.</h1>
          <form onSubmit={submit} style={{width: 400}}>
            <div className="form-group">
              <label data-testid="age" htmlFor="q1">What is your age?</label>
              <input data-testid="age-input" type="text" id="q1" autoComplete="off" className="form-control" onChange={e => setAge(e.target.value)} />
            </div>
            <div className="form-group">
              <label data-testid="gender" htmlFor="q2">What is your gender?</label>
              <input data-testid="gender-input" type="text" id="q2" autoComplete="off" className="form-control" onChange={e => setGender(e.target.value)} />
            </div>
            <div className="form-group">
              <label data-testid="year" htmlFor="q3">What is your year of study?</label>
              <input data-testid="year-input" type="text" id="q3" autoComplete="off" className="form-control" onChange={e => setYearOfStudy(e.target.value)} />
            </div>
            <button data-testid="button" className="btn btn-primary" type="submit">
              Submit
            </button>
          </form>
        </Fragment>
      )}
    </Fragment>
  )
}

export default Questions
