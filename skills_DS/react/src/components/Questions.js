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
        <h1>{error}</h1>
      ) : received ? (
        <h1>Thank you for answering the questions!</h1>
      ) : (
        <Fragment>
          <h1>Welcome, please answer some questions.</h1>
          <form onSubmit={submit} style={{width: 400}}>
            <div className="form-group">
              <label htmlFor="q1">What is your age?</label>
              <input type="number" id="q1" min="1" max="99" autoComplete="off" className="form-control" onChange={e => setAge(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="q2">What is your gender?</label>
              <select  className="form-control" id="q2" onChange={e => setGender(e.target.value)}>
                  <option disabled selected value> select an option </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="q3">What is your year of study?</label>
              <select className="form-control" id="q3" onChange={e => setYearOfStudy(e.target.value)}> 
                  <option disabled selected value > select an option </option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="5+">5+</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </form>
        </Fragment>
      )}
    </Fragment>
  )
}

export default Questions
