import axios from "axios"
import Cookies from "js-cookie"

const GetSkills = props => {
  const submit = event => {
    event.preventDefault()
    let {position, location, number} = event.target.elements
    axios
      .post("/api/get-jobs", {position: position.value, location: location.value, number: number.value}, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(res => {
        console.log(res.data.hey)
      })
      .catch(err => {
        console.error(err)
      })
  }
  return (
    <div>
      <form onSubmit={submit} style={{width: 400}}>
        <div className="form-group">
          <label htmlFor="position">Position:</label>
          <input type="text" id="position" autoComplete="off" className="form-control" name="position" />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input type="text" id="location" autoComplete="off" className="form-control" name="location" />
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
  )
}

export default GetSkills
