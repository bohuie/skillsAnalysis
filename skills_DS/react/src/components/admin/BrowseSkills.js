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
      console.log(data)
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
            {skills.map(({name, job_title}, idx) => {
              let skill = name + ":" + job_title
              return (
                <div className="form-inline" key={idx}>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name={skill} id={"good:" + skill} value={"good:" + skill} />
                    <label class="form-check-label" for={"good:" + skill}>
                      Valid
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name={skill} id={"invalid:" + skill} value={"invalid:" + skill} />
                    <label class="form-check-label" for={"invalid:" + skill}>
                      Invalid
                    </label>
                  </div>
                  <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name={skill} id={"invalid2:" + skill} value={"invalid2:" + skill} />
                    <label class="form-check-label" for={"invalid2:" + skill}>
                      Invalid for job
                    </label>
                  </div>
                  <div className="form-check-inline">
                    <label>Skill: "{name}"</label>
                  </div>
                  <div className="form-check-inline">
                    <label>Job Title: "{job_title}"</label>
                  </div>
                </div>
              )
            })}
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
