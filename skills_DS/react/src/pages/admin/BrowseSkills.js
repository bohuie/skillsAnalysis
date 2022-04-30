import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"
import Alert from "../../components/Alert"

const BrowseSkills = props => {
  const [skills, setSkills] = useState([])
  const [alert, setAlert] = useState({
    visible: false,
    type: "",
    message: ""
  });

  const dismissAlert = () => {
    setAlert({ visible: false })
  }

  useEffect(() => {
    setAlert({
      visible: true,
      type: "success",
      message: <span>Fetching Skills...&nbsp;&nbsp;<span class="spinner-border spinner-border-sm text-success" role="status"></span></span>
    });
    axios
      .get("/api/list-skills", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then((response) => {
        setAlert({ visible: false });
        setSkills(response.data)
        console.log(response)
      })
      .catch((error) => {
        setAlert({
          visible: true,
          type: "danger",
          message: <span><strong>Error!</strong> Something went wrong. Please try again later.</span>
        });
        console.error(error)
      })
  }, [])

  const handleSubmission = (event) => {
    event.preventDefault()
    let inputs = event.target.elements
    inputs = [...inputs]
    let data = []
    inputs.forEach(input => {
      if (input.checked) {
        let inputData = input.id.split(":")
        data.push({ skill: inputData[1], job_title: inputData[2], value: inputData[0] })
      }
    })
    axios.post("/api/update-skills", data, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then((response) => {
        setSkills(response.data.new_skills)
        setAlert({
          visible: true,
          type: "success",
          message: <span><strong>Success!</strong> Successfully updated skills and retrieved new set of skills.</span>
        });
      }).catch((error) => {
        setAlert({
          visible: true,
          type: "danger",
          message: <span><strong>Error!</strong> Something went wrong. Please try again later.</span>
        });
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

      <div class="shadow p-3 mb-5 bg-white rounded">
        <form onSubmit={handleSubmission}>
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
              {skills.map(({ name, job_title }, idx) => {
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
                        <input class="form-check-input" type="radio" name={skill} id={"invalid:" + skill} value={"invalid:" + skill} />
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
              <tr>
                <td colSpan={5}>
                  <button className="btn btn-primary w-100" type="submit">
                    Submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </Fragment>
  )
}

export default BrowseSkills
