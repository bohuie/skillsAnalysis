import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"
import Alert from "../components/Alert";
import SankeyChart from "../components/SankeyChart";
import * as d3 from "d3";
import Select from 'react-select'


const Profile = props => {
    const [rawData, setRawData] = useState([{ source: null, target: null, value: null }]);
    const [filteredData, setfilteredData] = useState(rawData);
    const [alert, setAlert] = useState({
        visible: false,
        type: "",
        message: ""
    });

    const dismissAlert = () => {
        setAlert({ visible: false })
    }

    const handleFilterChange = (f) => {
        if (f.length > 0) {
            let arr = f.map(item => item.value);
            setfilteredData(rawData.filter(item => !arr.includes(item.target)));
        } else {
            setfilteredData(rawData);
        }

    }

    useEffect(() => {
        axios.get("/api/get-skills-info", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
            .then((response) => {
                console.log(response.data.skills_info);
                var skills_info = response.data.skills_info;

                var raw_data = skills_info.map(skill_info => { return { source: skill_info.name, target: skill_info.job_title__name, value: skill_info.count } });
                raw_data = raw_data.filter(skills_info => skills_info.source != skills_info.target);
                setRawData(raw_data);
                setfilteredData(raw_data);
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
                            <td className="w-25">
                                Exclude:
                            </td>
                            <td>
                                <Select
                                    onChange={handleFilterChange}
                                    isMulti={true}
                                    options={[...new Set(rawData.map(item => item.target))].map((item) => ({ 'label': item, 'value': item }))}
                                />
                            </td>
                        </tr>
                    </tbody>
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
