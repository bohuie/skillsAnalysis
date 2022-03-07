import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"

const Profile = props => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [skills, setSkills] = useState([])
    const [profile, setProfile] = useState([])

    useEffect(() => {
        axios
            .get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then(({ data }) => {
                if (data.success) {
                    setSkills(JSON.parse(data.success.skills))
                    setProfile(data)
                    console.log(JSON.parse(data.success.skills))
                }
                else
                    setError("Unable to get data.")
                console.log(data)
            })
            .catch(err => {
                console.error(err)
                setError("Unable to get data.")
            })
    }, [])

    return (
        <Fragment>
            {error ? (
                <h1 style={{ textAlign: "center" }}>{error}</h1>
            ) : (
                <div class="shadow p-3 mb-5 bg-white rounded">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Skill</th>
                                <th scope="col">Is this skill invalid?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                skills.map(skill => {
                                    return (
                                        <tr>
                                            <td>
                                                <div className="form-check-inline">
                                                    <label>{skill}</label>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="form-check form-check-inline">
                                                    <input class="form-check-input" type="checkbox" name={skill} id={"good:" + skill} value={"good:" + skill} />
                                                    <label class="form-check-label" for={"good:" + skill}>
                                                        Invalid
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </Fragment>
    )
}

export default Profile
