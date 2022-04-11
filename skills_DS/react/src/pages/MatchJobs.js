import axios from "axios"
import {useState, useEffect, Fragment} from "react"
import Cookies from "js-cookie"
import professions from "professions"
import {googleMapsKey} from "../secrets.json"
import Alert from "../components/Alert"

const MatchJobs = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [jobs, setJobs] = useState(null)
  const [scene, setScene] = useState(0)
  const [skipped, setSkipped] = useState(0)

  const matchJobs = event => {
    event.preventDefault()
    setLoading(true)
    let {position, location, radius, remote} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.value}&key=${googleMapsKey}`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = remote.value === "only" ? "remote" : address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        let country = address_components.find(ac => ac.types.includes("country")).short_name
        return axios.post(
          "/api/match-jobs",
          {
            position: position.value,
            location: {name: loc, ...results[0].geometry.location, country},
            remote: remote.value,
            distance: radius.value || 0
          },
          {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}}
        )
      })
      .then(({data}) => {
        setLoading(false)
        if (data.jobs.length === 0) {
          return setError("Your skills do not match any jobs with the given conditions.")
        }
        setJobs(data.jobs.sort((a, b) => b.score - a.score))
        setSkipped(data.skipped)
        setScene(1)
      })
      .catch(err => {
        setLoading(false)
        if (err.response.status === 503) {
          setError("We can't find any jobs with the specified conditions, please check back in a minute.")
        } else {
          setError(err.response.data.message)
        }
      })
  }

  const goBack = () => {
    setScene(0)
    setLoading(false)
    setError(false)
  }

  return (
    <Fragment>
      {loading ? (
        <h2>Loading...</h2>
      ) : error ? (
        <Alert message={error} visible type="danger" handleDismiss={goBack} />
      ) : scene == 0 ? (
        <form onSubmit={matchJobs}>
          <div className="form-group">
            <label htmlFor="position">Position:</label>
            <input list="brow" id="position" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location:</label>
            <input id="location" type="text" autoComplete="off" name="location" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="remote">Remote:</label>
            <select id="remote" className="form-control form-control" name="remote" defaultValue="allowed">
              <option value="none">None</option>
              <option value="allowed">Allowed</option>
              <option value="only">Only</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="radius">Radius (km):</label>
            <input type="number" id="radius" className="form-control" name="radius" />
          </div>
          <button className="btn btn-primary" type="submit">
            Match Jobs
          </button>
        </form>
      ) : (
        <Fragment>
          {jobs.map(({job, score}, i) => {
            return (
              <div key={i} className="card">
                <div className="card-body">
                  <div style={{display: "inline"}}>
                    <div style={{float: "right", width: 150 - 150 * (score / jobs[0].score), height: 15, background: "gray"}} />
                    <div style={{float: "right", width: 150 * (score / jobs[0].score), height: 15, background: "green"}} />
                  </div>
                  <h5 className="card-title">
                    <a href={job.url} target="_blank" rel="noopener noreferrer">
                      {job.title}
                    </a>
                  </h5>
                  <p className="card-title">{job.company}</p>
                  <p className="card-title" style={{textTransform: "capitalize"}}>
                    {job.place}
                  </p>
                  {job.is_remote ? <p className="card-title">Remote: &#x2713;</p> : <p className="card-title">Remote: &#x2717;</p>}
                  <p
                    className="card-text"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {job.description}
                  </p>
                </div>
              </div>
            )
          })}
          <br />
          {jobs.length < 10 && <h2 style={{textAlign: "center"}}>{skipped} jobs didn't match your skills.</h2>}
        </Fragment>
      )}
    </Fragment>
  )
}

export default MatchJobs
