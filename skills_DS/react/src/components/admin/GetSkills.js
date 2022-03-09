import axios from "axios"
import Cookies from "js-cookie"
import {useState, Fragment} from "react"
import professions from "professions"
import {googleMapsKey} from "../../secrets.json"

const GetSkills = props => {
  const [scrapeError, setScrapeError] = useState(null)
  const [extractError, setExtractError] = useState(null)

  const scrapeJobs = event => {
    event.preventDefault()
    setScrapeError(null)
    let {position, number, remote, location, radius} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.value}&key=${googleMapsKey}`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = remote.value === "only" ? "remote" : address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        let country = address_components.find(ac => ac.types.includes("country")).short_name
        return axios.post("/api/get-jobs", {position: position.value, location: {name: loc, ...results[0].geometry.location}, number: number.value, country, remote: remote.value, radius: radius.value || 0}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      })
      .then(res => {
        console.log(res.data.hey)
      })
      .catch(err => {
        console.error(err)
        setScrapeError(err.toString())
      })
  }

  const extractSkills = event => {
    event.preventDefault()
    setExtractError(null)
    let {extractPosition, extractLocation, distance} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${extractLocation.value}&key=${googleMapsKey}`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        return axios.post("/api/get-skills", {position: extractPosition.value, location: {name: loc, ...results[0].geometry.location}, distance: distance.value}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      })
      .then(({data}) => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
        setExtractError(err.toString())
      })
  }

  return (
    <Fragment>
      <div class="shadow p-3 mb-5 bg-white rounded">
        <h1 data-testid="scrape-header">Scrape Jobs</h1>
        <form onSubmit={scrapeJobs}>
          <div className="form-group">
            <label data-testid="position-label" htmlFor="position">Position:</label>
            <input list="brow" id="position" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label data-testid="location-label" htmlFor="location">Location:</label>
            <input id="location" type="text" autoComplete="off" name="location" className="form-control" />
          </div>
          <div className="form-group">
            <label data-testid="remote-label" htmlFor="remote">Remote:</label>
            <select id="remote" className="form-control form-control" name="remote" defaultValue="allowed">
              <option value="none">None</option>
              <option value="allowed">Allowed</option>
              <option value="only">Only</option>
            </select>
          </div>
          <div className="form-group">
            <label data-testid="jobs-label" htmlFor="number">Number of jobs to fetch:</label>
            <input type="number" id="number" autoComplete="off" className="form-control" name="number" />
          </div>
          <div className="form-group">
            <label data-testid="radius-label" htmlFor="radius">Radius (km):</label>
            <input type="number" id="radius" className="form-control" name="radius" />
          </div>
          <button data-testid="jobs-button" className="btn btn-primary" type="submit">
            Get jobs
          </button>
        </form>
        {scrapeError && <p className="text-danger">{scrapeError}</p>}
      </div>
      <br />
      <div class="shadow p-3 mb-5 bg-white rounded">
        <h1 data-testid="extract-header">Extract Skills</h1>
        <form onSubmit={extractSkills}>
          <div className="form-group">
            <label data-testid="position-extract-label" htmlFor="extractPosition">Position:</label>
            <input list="brow" id="extractPosition" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label data-testid="location-extract-label" htmlFor="extractLocation">Location:</label>
            <input id="extractLocation" type="text" autoComplete="off" className="form-control form-control" />
          </div>
          <div className="form-group">
            <label data-testid="distance-extract-label" htmlFor="distance">Max distance away (km):</label>
            <input id="distance" type="number" className="form-control form-control" />
          </div>
          <button data-testid="skills-button" className="btn btn-primary" type="submit">
            Get Skills
          </button>
        </form>
        {extractError && <p className="text-danger">{extractError}</p>}
      </div>
    </Fragment>
  )
}

export default GetSkills
