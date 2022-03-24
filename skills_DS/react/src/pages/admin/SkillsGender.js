import axios from "axios"
import Cookies from "js-cookie"
import { useState, useEffect, Fragment } from "react"

const SkillsGender = () => {

    const [skills, setSkills] = useState([]);

    useEffect(() => {
        axios.get("/api/skills-gender", {
            headers: {"X-CSRFTOKEN": Cookies.get("csrftoken")}
        }).then((result) => {
            setSkills(
                result.data.profile.map((data, index) => (
                    {id: index, gender: data.gender, skills: JSON.parse(data.skills) }
                ))
            )
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        if (skills.length === 0) return
        console.log(skills)
    }, [skills])

    return (
        <div>
            <h1>Skills</h1>
        </div>
    )
}

export default SkillsGender