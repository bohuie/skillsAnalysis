import React from "react"
import ReactDOM from "react-dom"
import WordCloud from "react-d3-cloud"
import axios from "axios"
import Cookies from "js-cookie"
import {useState, Fragment, useEffect} from "react"

const WC = () => {
  const [jobTitles, setjobTitles] = useState([])
  const [job, setJob] = useState(null)
  const [error, setError] = useState(null)
  const [profession, setProfession] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = e => {
    var data
    e.preventDefault()
    axios
      .post("/api/get-job-skills", {job}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(s => {
        data = s.data.skills.map(({name, count}) => ({text: name, value: count}))
        ReactDOM.render(
          <div id="root">
            <WordCloud data={data} width={200} height={200} rotate={0} padding={0} />
            <h2>
              <a href="/match-jobs">Find jobs that are looking for your skills.</a>
            </h2>
          </div>,
          document.getElementById("render"),
          c
        )
      })
      .catch(err => {
        console.error(err)
        setError("unable to get data")
      })
  }
  const c = () => {
    setLoading(false)
  }
  useEffect(() => {
    axios
      .get("/api/get-job-titles", {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(({data}) => {
        setjobTitles(data.title)
      })
      .catch(err => {
        console.error(err)
        setError("database is empty")
      })
  }, [])

  const handleChange = e => {
    setProfession(e.target.value)
    setJob(e.target.value)
  }

  return (
    <Fragment>
      <div className="dropdown">
        <form onSubmit={submit} style={{display: "flex"}}>
          <div className="form">
            <select name="profession" value={profession} className="form-control w-100" onChange={handleChange}>
              <option disabled selected value>
                {" "}
                select an option{" "}
              </option>
              {jobTitles.map(title => {
                return (
                  <option value={title.name} key={title.id}>
                    {title.name}
                  </option>
                )
              })}
            </select>
          </div>
          <div className="button">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!profession}
              onClick={() => {
                setLoading(true)
              }}
            >
              Enter
            </button>
          </div>
        </form>
      </div>
      <div>{loading ? <h3>loading...</h3> : <div></div>}</div>
      <div id="render"></div>
    </Fragment>
  )
}

export default WC
