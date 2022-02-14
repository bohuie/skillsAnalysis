import axios from "axios"
import Cookies from "js-cookie"
import {useState, Fragment} from "react"
import MapPicker from "react-google-map-picker"
import professions from "professions"

const GetSkills = props => {
  const [location, setLocation] = useState({lat: 49.89722485901494, lng: -119.49617829276382})
  const [zoom, setZoom] = useState(6)

  const scrapeJobs = event => {
    event.preventDefault()
    let {position, number, remote} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=AIzaSyB0As7IPt8tavUq7y76sIizwMyHnWbkrBk`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = remote.value === "only" ? "remote" : address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        let country = address_components.find(ac => ac.types.includes("country")).short_name
        return axios.post("/api/get-jobs", {position: position.value, location: {name: loc, ...results[0].geometry.location}, number: number.value, country, remote: remote.value}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      })
      .then(res => {
        console.log(res.data.hey)
      })
      .catch(err => {
        console.error(err)
      })
  }

  const extractSkills = event => {
    event.preventDefault()
    let {extractPosition, extractLocation, distance} = event.target.elements
    axios
      .get(`https://maps.googleapis.com/maps/api/geocode/json?address=${extractLocation.value}&key=AIzaSyB0As7IPt8tavUq7y76sIizwMyHnWbkrBk`)
      .then(({data: {results}}) => {
        if (results.length === 0) throw "Could not get location"
        let {address_components} = results[0]
        let loc = address_components.find(ac => ac.types.includes("sublocality"))?.long_name || address_components.find(ac => ac.types.includes("locality"))?.long_name + " " + address_components.find(ac => ac.types.includes("administrative_area_level_1")).long_name
        console.log(loc)
        return axios.post("/api/get-skills", {position: extractPosition.value, location: {name: loc, ...results[0].geometry.location}, distance: distance.value}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      })
      .then(({data}) => {
        console.log(data)
      })
      .catch(err => {
        console.error(err)
      })
  }

  function handleChangeLocation(lat, lng) {
    setLocation({lat: lat, lng: lng})
  }

  function handleChangeZoom(newZoom) {
    setZoom(newZoom)
  }

  return (
    <Fragment>
      <div class="shadow p-3 mb-5 bg-white rounded">
        <h1>Scrape Jobs</h1>
        <form onSubmit={scrapeJobs}>
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
            <MapPicker defaultLocation={location} zoom={zoom} style={{height: "400px"}} onChangeLocation={handleChangeLocation} onChangeZoom={handleChangeZoom} apiKey="AIzaSyB0As7IPt8tavUq7y76sIizwMyHnWbkrBk" />
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
            <label htmlFor="number">Number of jobs to fetch:</label>
            <input type="number" id="number" autoComplete="off" className="form-control" name="number" />
          </div>
          <button className="btn btn-primary" type="submit">
            Get jobs
          </button>
        </form>
      </div>
      <br />
      <div class="shadow p-3 mb-5 bg-white rounded">
        <h1>Extract Skills</h1>
        <form onSubmit={extractSkills}>
          <div className="form-group">
            <label htmlFor="extractPosition">Position:</label>
            <input list="brow" id="extractPosition" className="form-control form-control" />
            <datalist id="brow">
              {professions.map((profession, index) => (
                <option value={profession} key={index} />
              ))}
            </datalist>
          </div>
          <div className="form-group">
            <label htmlFor="extractLocation">Location:</label>
            <input id="extractLocation" type="text" autoComplete="off" className="form-control form-control" />
          </div>
          <div className="form-group">
            <label htmlFor="distance">Max distance away (km):</label>
            <input id="distance" type="number" className="form-control form-control" />
          </div>
          <button className="btn btn-primary" type="submit">
            Get Skills
          </button>
        </form>
      </div>
    </Fragment>
  )
}

export default GetSkills
