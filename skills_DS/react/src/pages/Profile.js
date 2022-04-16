import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"
import Alert from "../components/Alert";
import SankeyChart from "../components/SankeyChart";
import * as d3 from "d3";
import Select from 'react-select'


const Profile = props => {
    const options = [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
    ]
    const handleFilterChange = (f) => {
        if (f.length > 0) {
            let arr = f.map(item => item.value);
            setfilteredData(data_obj.filter(item => !arr.includes(item.target)));
        } else {
            setfilteredData(data_obj);
        }

    }
    const data = `[{"source":"javascript","target":"Software Development Engineer","frequency":512,"value":56,"time":1},{"source":"sql","target":"Software Development Engineer","frequency":431,"value":47,"time":1},{"source":"kubernetes","target":"Software Development Engineer","frequency":160,"value":17,"time":1},{"source":"work remotely","target":"Software Development Engineer","frequency":155,"value":17,"time":1},{"source":"problem solving","target":"Data Scientist","frequency":147,"value":24,"time":1},{"source":"cad","target":"Electronic Engineer","frequency":118,"value":17,"time":1},{"source":"technical support","target":"Electronic Engineer","frequency":107,"value":15,"time":1},{"source":"work remotely","target":"Electronic Engineer","frequency":106,"value":15,"time":1},{"source":"audit","target":"Finance","frequency":199,"value":36,"time":1},{"source":"financial services","target":"Finance","frequency":158,"value":28,"time":1},{"source":"financial analyst","target":"Finance","frequency":128,"value":23,"time":1},{"source":"risk management","target":"Finance","frequency":127,"value":23,"time":1},{"source":"vendor","target":"Project Manager","frequency":246,"value":33,"time":1},{"source":"construction management","target":"Project Manager","frequency":132,"value":17,"time":1},{"source":"organizational skills","target":"Project Manager","frequency":109,"value":14,"time":1},{"source":"management skills","target":"Customer Support","frequency":89,"value":9,"time":1}]`;
    const data_obj = JSON.parse(data);
    const [filteredData, setfilteredData] = useState(data_obj);
    const [alert, setAlert] = useState({
        visible: false,
        type: "",
        message: ""
    });
    const [versions, setVersions] = useState([]);
    const [selected_version, setSelectedVersion] = useState('');
    const [skills, setSkills] = useState([]);
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        gender: '',
        age: '',
        year_of_study: '',
        skills: ''
    });

    const [skills_info, setSkillsInfo] = useState([])

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

    const handleVersionChange = (v) => {
        setSelectedVersion(v);
        setSkills(
            profile.skills[v.timestamp].map((skill, index) => (
                { id: index, value: skill }
            ))
        );
    }

    const updateSkillsInfo = () => {
        console.log(skills)
        let skills_array = [];
        skills.forEach((s) => {
            skills_array.push(s.value.toLowerCase());
        })
        axios.post("/api/get-skills-info", { 'skills': skills_array }, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then((response) => {
                console.log(response);
                setSkillsInfo(response.data.skills_info);
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


    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post("/api/update-user-skills", { 'timestamp': selected_version.timestamp, 'skills': skills }, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
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
        console.log(data_obj);
        let t = [...new Set(data_obj.map(item => item.target))].map((item) => ({ 'label': item, 'value': item }));
        console.log(t)
        var temp_skills = null;
        axios.get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then((response) => {
                console.log(response);
                let r_profile = response.data.profile;
                setProfile({
                    full_name: r_profile.full_name,
                    email: r_profile.email,
                    gender: r_profile.gender,
                    age: r_profile.age,
                    year_of_study: r_profile.yearOfStudy,
                    skills: r_profile.skills
                });
                //let t = Object.keys(r_profile.skills).reduce((a, b) => a > b ? a : b);
                let versions = Object.keys(r_profile.skills).sort().map((val, index) => {
                    return { version: index + 1, timestamp: val }
                });
                setVersions(versions);
                setSelectedVersion(versions[0]);
                temp_skills = r_profile.skills[versions[0].timestamp].map((skill, index) => (
                    { id: index, value: skill }
                ));
                setSkills(temp_skills);
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

    useEffect(() => {
        updateSkillsInfo();
    }, [skills])

    return (
        <Fragment>
            <Alert
                visible={alert.visible}
                type={alert.type}
                message={alert.message}
                handleDismiss={dismissAlert}
            />

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
                                <th scope="col">{"Skills - Resume v" + selected_version.version}</th>
                                <th scope="col">
                                    <div class="dropdown form-check w-100">
                                        <button class="btn btn-primary dropdown-toggle w-100" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-expanded="false">
                                            Select resume version
                                        </button>
                                        <div class="dropdown-menu w-100" aria-labelledby="dropdownMenuButton">
                                            {
                                                versions.map((v, index) => {
                                                    return (
                                                        <button class="dropdown-item" type="button" onClick={() => handleVersionChange(v)}>
                                                            {"v" + v.version + " - " + new Date(v.timestamp * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </button>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </th>
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
            <div className="shadow p-3 mb-5 bg-white rounded">
                <table className="table">
                    <tr className="table-borderless">
                        <td className="w-25">
                            Exclude:
                        </td>
                        <td>
                            <Select
                                onChange={handleFilterChange}
                                isMulti={true}
                                options={[...new Set(data_obj.map(item => item.target))].map((item) => ({ 'label': item, 'value': item }))}
                            />
                        </td>
                    </tr>
                </table>


                <SankeyChart
                    links={filteredData}
                    nodeGroup={d => d.id.split(/\W/)[0]} // take first word for color
                    nodeAlign={'justify'} // e.g., d3.sankeyJustify; set by input above
                    linkColor='source-target' // e.g., "source" or "target"; set by input above
                    format={(f => d => `${f(d)} occurences`)(d3.format(",.1~f"))}
                    nodePadding={5}
                    linkStrokeOpacity={0.4}
                    width={1080}
                    height={1080}
                    marginRight={10}
                    marginLeft={10}
                    marginTop={0}
                    marginBottom={10}
                />
            </div>
        </Fragment >
    )
}

export default Profile
