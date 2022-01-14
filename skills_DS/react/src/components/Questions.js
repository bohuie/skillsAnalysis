import {Fragment, useState, useEffect} from "react"
import axios from "axios"

const Questions = props => {
  const [age, setAge] = useState(null)
  const [gender, setGender] = useState(null)
  const [yearOfStudy, setYearOfStudy] = useState(null)

  const [received, setReceived] = useState(false)
  const [error, setError] = useState(null)

  const submit = e => {
    e.preventDefault()
    axios
      .post("/api/answers", {age, gender, yearOfStudy}, {headers: {"X-CSRFTOKEN": getCookie("csrftoken")}})
      .then(res => {
        console.log(res.data)
        setReceived(true)
      })
      .catch(err => {
        console.error(err, err?.response, err?.response?.data)
        setError("bad request")
      })
  }

  function getCookie(name) {
    let cookieValue = null
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";")
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
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
              <input type="text" id="q1" autoComplete="off" className="form-control" onChange={e => setAge(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="q2">What is your gender?</label>
              <input type="text" id="q2" autoComplete="off" className="form-control" onChange={e => setGender(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="q1">What is your year of study?</label>
              <input type="text" id="qi" autoComplete="off" className="form-control" onChange={e => setYearOfStudy(e.target.value)} />
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
