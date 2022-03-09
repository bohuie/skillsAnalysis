import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"
import Alert from "../components/Alert";

const Profile = props => {
    const [alert, setAlert] = useState({
        visible: false,
        type: "",
        message: ""
    });
    const [skills, setSkills] = useState([]);
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        gender: '',
        age: '',
        year_of_study: ''
    });

    const dismissAlert = () => {
        setAlert({ visible: false })
    }

    const handleEdit = (event, id) => {
        const newSkills = [...skills];
        newSkills.find((skill) => skill.id === id).value = event.target.value;
        setSkills(newSkills);
    }

    const handleDeleteRow = (id) => {
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
        axios.post("/api/update-user-skills", skills, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then((response) => {
                console.log(response);
                setAlert({
                    visible: true,
                    type: "success",
                    message: <span><strong>Success!</strong> Your skills has been updated.</span>
                });
            })
            .catch((error) => {
                console.error(error);
                setAlert({
                    visible: true,
                    type: "danger",
                    message: <span><strong>Error!</strong> {
                        error.response ? (error.response.data.message) : (error.message)
                    }</span>
                });
            });
    }

    useEffect(() => {
        axios.get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then((response) => {
                console.log(response);
                let profile = response.data.profile;
                setProfile({
                    full_name: profile.full_name,
                    email: profile.email,
                    gender: profile.gender,
                    age: profile.age,
                    year_of_study: profile.yearOfStudy,
                })
                setSkills(
                    JSON.parse(profile.skills).map((skill, index) => (
                        { id: index, value: skill }
                    ))
                );
            })
            .catch((error) => {
                console.error(error);
                setAlert({
                    visible: true,
                    type: "danger",
                    message: <span><strong>Error!</strong> {
                        error.response ? (error.response.data.message) : (error.message)
                    }</span>
                });
            });
    }, [])

    return (
        <Fragment>
            <div className="shadow p-3 mt-5 mb-5 bg-white rounded">
                <table className="table">
                    <tbody>
                        <tr className="table-borderless">
                            <td scope="col" colSpan="2">
                                <h3>
                                    {"Hello, " + profile.full_name + "!"}
                                </h3>
                            </td>
                        </tr>
                        <tr>
                            <td className="w-50">{"Email: " + profile.email}</td>
                            <td className="w-50">{"Gender: " + profile.gender}</td>
                        </tr>

                        <tr>
                            <td className="w-50">{"Age: " + profile.age}</td>
                            <td className="w-50">{"Year of Study: " + profile.year_of_study}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="shadow p-3 mb-5 bg-white rounded">
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
                                        <tr key={skill.id}>
                                            <td>
                                                <div className="form-check w-100">
                                                    <input type="text" className="form-control" onChange={(event) => handleEdit(event, skill.id)} value={skill.value} required></input>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="form-check w-100">
                                                    <button type="button" className="btn btn-danger w-100" onClick={() => handleDeleteRow(skill.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            <tr>
                                <td>
                                    <div className="form-check w-100">
                                        <button type="button" className="btn btn-primary w-100" onClick={handleAddRow}>Add a skill</button>
                                    </div>
                                </td>
                                <td>
                                    <div className="form-check w-100">
                                        <button type="submit" className="btn btn-success w-100">Submit</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>

            <Alert
                visible={alert.visible}
                type={alert.type}
                message={alert.message}
                handleDismiss={dismissAlert}
            />
        </Fragment >
    )
}

export default Profile
