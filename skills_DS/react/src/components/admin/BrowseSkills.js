import axios from "axios"
import Cookies from "js-cookie"
import {useState, Fragment, useEffect} from "react"

const BrowseSkills = props => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [skills, setSkills] = useState([])

  useEffect(() => {
    axios
      .get("/api/list-skills", {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}})
      .then(({data}) => {
        setSkills(data)
        setLoading(false)
        console.log(data)
      })
      .catch(err => {
        console.error(err)
        setError("Unable to get data.")
      })
  }, [])

  const submit = event => {
    event.preventDefault()
    setLoading(true)
    let inputs = event.target.elements
    inputs = [...inputs]
    let data = []
    inputs.forEach(input => {
      if (input.checked) {
        let inputData = input.id.split(":")
        data.push({skill: inputData[1], job_title: inputData[2], value: inputData[0]})
      }
    })
    axios.post("/api/update-skills", data, {headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}}).then(({data}) => {
      setSkills(data.new_skills)
      setLoading(false)
    })
  }

  return (
    <Fragment>
      {loading ? (
        <h1 style={{textAlign: "center"}}>Fetching Skills...</h1>
      ) : error ? (
        <h1 style={{textAlign: "center"}}>{error}</h1>
      ) : (
        <div class="shadow p-3 mb-5 bg-white rounded">
          <form onSubmit={submit}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Valid</th>
                  <th scope="col">Invalid</th>
                  <th scope="col">Invalid for specific job</th>
                  <th scope="col">Skill</th>
                  <th scope="col">Job Title</th>
                </tr>
              </thead>
              <tbody>
                {skills.map(({name, job_title}, idx) => {
                  let skill = name + ":" + job_title
                  return (
                    <tr key={idx}>
                      <td>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name={skill} id={"good:" + skill} value={"good:" + skill} />
                          <label class="form-check-label" for={"good:" + skill}>
                            Valid
                          </label>
                        </div>
                      </td>

                      <td>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name={skill} id={"invalid:" + skill} value={"invalid:" + skill} checked />
                          <label class="form-check-label" for={"invalid:" + skill}>
                            Invalid
                          </label>
                        </div>
                      </td>
                      <td>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" name={skill} id={"invalid2:" + skill} value={"invalid2:" + skill} />
                          <label class="form-check-label" for={"invalid2:" + skill}>
                            Invalid for job
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="form-check-inline">
                          <label>{name}</label>
                        </div>
                      </td>
                      <td>
                        <div className="form-check-inline">
                          <label>{job_title}</label>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <button className="btn btn-primary" type="submit">
              Submit
            </button>
          </form>
        </div>
      )}
    </Fragment>
  )
}

export default BrowseSkills
