import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment } from "react"
import professions from "professions"
import Alert from "../../components/Alert"

const GetSkills = props => {
  const [extractError, setExtractError] = useState(null)
  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: ""
  });

  const dismissAlert = () => {
    setAlert({ visible: false })
  }
  
  const REACT_APP_GOOGLE_MAPS_KEY = "AIzaSyDXcZrBQloC9mdrUbmKrLo9Q8AqfI1ifs8";

  const scrapeJobs = event => {
    event.preventDefault()
    let { position, number, remote, location, radius } = event.target.elements
    console.log(process.env.REACT_APP_GOOGLE_MAPS_KEY);
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location.value}&key=${REACT_APP_GOOGLE_MAPS_KEY}`)
      .then(({ data: { results } }) => {
        if (results.length === 0) throw "Could not get location"
        let { address_components } = results[0]
        let loc = remote.value === "only" ? "remote" : address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        let country = address_components.find(ac => ac.types.includes("country")).short_name
        axios
          .post("/api/scrape-jobs", {
            position: position.value,
            location: { name: loc, ...results[0].geometry.location },
            number: number.value,
            country,
            remote: remote.value,
            radius: radius.value || 0
          }, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
          .then((response) => {
            setAlert({
              visible: true,
              type: "success",
              message: <span><strong>Success!</strong> Scraping jobs...&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>
            });
            setTimeout(checkScrapeProgress, 2000);
          })
          .catch((error) => {
            setAlert({
              visible: true,
              type: "danger",
              message: <span><strong>Error!</strong> Something went wrong.</span>
            });
            console.error(error);
          })
      })
      .catch((error) => {
        setAlert({
          visible: true,
          type: "danger",
          message: <span><strong>Error!</strong> {error.toString()}</span>
        });
        console.error(error);
      })
  }

  const checkScrapeProgress = () => {
    axios.get("/api/scrape-jobs", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then((response) => {
        let progress = response.data.progress
        console.log(response)
        if (progress.processing) {
          setAlert({
            visible: true,
            type: "success",
            message: <span><strong>Scraping...</strong> Scraped {progress.num_scraped} jobs.&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>
          });
          setTimeout(checkScrapeProgress, 2000);
        } else {
          setAlert({
            visible: true,
            type: "success",
            message: <span><strong>Done!</strong> Scraped {progress.num_scraped} jobs.</span>
          });
        }
      })
      .catch((error) => {
        setAlert({
          visible: true,
          type: "danger",
          message: <span><strong>Error!</strong> Something went wrong.</span>
        });
        console.error(error);
      })
  }

   const extractSkills = event => {
    event.preventDefault()
    setExtractError(null)
    let {extractPosition, extractLocation, distance} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${extractLocation.value}&key=${REACT_APP_GOOGLE_MAPS_KEY}`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        return axios.post("/api/get-skills", {position: extractPosition.value, location: {name: loc, ...results[0].geometry.location}, distance: distance.value}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      })
      .then(({data}) => {
        console.log(data)
        setAlert({
          visible: true,
          type: "success",
          message: (
            <span>
              <strong>Success!</strong> Extracting skills...&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span>
            </span>
          )
        })
        setTimeout(checkExtractProgress, 2000)
      })
      .catch(err => {
        console.error(err)
        setAlert({
          visible: true,
          type: "danger",
          message: (
            <span>
              <strong>Error!</strong> {error.toString()}
            </span>
          )
        })
      })
  }

  const checkExtractProgress = () => {
    axios
      .get("/api/get-skills", {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(response => {
        let progress = response.data.progress
        console.log(response)
        if (progress.processing) {
          setAlert({
            visible: true,
            type: "success",
            message: (
              <span>
                <strong>Extracting...</strong> Extracted {progress.num_processed} skills.&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span>
              </span>
            )
          })
          setTimeout(checkExtractProgress, 2000)
        } else {
          setAlert({
            visible: true,
            type: "success",
            message: (
              <span>
                <strong>Done!</strong> Extracted {progress.num_processed} skills.
              </span>
            )
          })
        }
      })
      .catch(error => {
        setAlert({
          visible: true,
          type: "danger",
          message: (
            <span>
              <strong>Error!</strong> Something went wrong.
            </span>
          )
        })
        console.error(error)
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

      <div className="shadow p-3 mb-5 bg-white rounded">
        <h1 data-testid="scrape-header">Scrape Jobs</h1>
        <form onSubmit={scrapeJobs}>
          <div className="form-group">
            <label htmlFor="position" data-testid="position-label">Position:</label>
            <input list="brow" id="position" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label htmlFor="location" data-testid="location-label">Location(City,Province/State):</label>
            <input id="location" type="text" autoComplete="off" name="location" className="form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="remote" data-testid="remote-label">Remote:</label>
            <select id="remote" className="form-control form-control" name="remote" defaultValue="allowed">
              <option value="none">None</option>
              <option value="allowed">Allowed</option>
              <option value="only">Only</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="number" data-testid="jobs-label">Number of jobs to fetch:</label>
            <input type="number" id="number" autoComplete="off" className="form-control" name="number" />
          </div>
          <div className="form-group">
            <label htmlFor="radius" data-testid="radius-label">Radius (km):</label>
            <input type="number" id="radius" className="form-control" name="radius" />
          </div>
          <button className="btn btn-primary" data-testid="jobs-button" type="submit">
            Get jobs
          </button>
        </form>
      </div>

      <div className="shadow p-3 mb-5 bg-white rounded">
        <h1 data-testid="extract-header">Extract Skills</h1>
        <form onSubmit={extractSkills}>
          <div className="form-group">
            <label htmlFor="extractPosition" data-testid="position-extract-label">Position:</label>
            <input list="brow" id="extractPosition" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="extractLocation" data-testid="location-extract-label">Location:</label>
            <input id="extractLocation" type="text" autoComplete="off" className="form-control form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="distance" data-testid="distance-extract-label">Max distance away (km):</label>
            <input id="distance" type="number" className="form-control form-control" />
          </div>
          <button className="btn btn-primary" data-testid="skills-button" type="submit">
            Get Skills
          </button>
        </form>
        {extractError && <p className="text-danger">{extractError}</p>}
      </div>
    </Fragment>
  )
}

export default GetSkills
