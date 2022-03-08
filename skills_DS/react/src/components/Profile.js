import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"

const Profile = props => {
    const [error, setError] = useState(null)
    const [skills, setSkills] = useState([])
    const [profile, setProfile] = useState([])

    const handleEdit = (event, id) => {
        const newSkills = [...skills];
        newSkills.find((skill) => skill.id === id).value = event.target.value;
        setSkills(newSkills);
    }

    const handleDeleteClick = (id) => {
        const newSkills = [...skills];
        const index = newSkills.findIndex((skill) => skill.id === id);
        newSkills.splice(index, 1);
        setSkills(newSkills);
    };

    const handleAddRow = () => {
        const newSkills = [...skills];
        const max_index = Math.max.apply(Math, newSkills.map(function (o) { return o.id; }))
        newSkills.push({ id: max_index + 1, value: "" });
        setSkills(newSkills);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log(skills);
    }

    useEffect(() => {
        axios
            .get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then(({ data }) => {
                if (data.success) {
                    setSkills(JSON.parse(data.success.skills).map((skill, index) => (
                        { id: index, value: skill }
                    )));
                    setProfile(data)
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
                    <form onSubmit={handleSubmit}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Skills</th>
                                    <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    skills.map((skill) => {
                                        return (
                                            <tr>
                                                <td>
                                                    <div className="form-check w-100">
                                                        <input type="text" class="form-control" onChange={(event) => handleEdit(event, skill.id)} value={skill.value}></input>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="form-check w-100">
                                                        <button type="button" class="btn btn-danger w-100" onClick={() => handleDeleteClick(skill.id)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }
                                <tr>
                                    <td>
                                        <div className="form-check w-100">
                                            <button type="button" class="btn btn-primary w-100" onClick={handleAddRow}>Add a skill</button>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="form-check w-100">
                                            <button type="submit" class="btn btn-success w-100">Submit</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </div>
            )
            }
        </Fragment >
    )
}

export default Profile
