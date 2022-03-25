import axios from "axios";
import Cookies from "js-cookie";
import { useState, useEffect, Fragment } from "react";
import ReactDOM from 'react-dom';
import d3 from 'd3';
import WordCloud from "react-d3-cloud";

const SkillsGender = () => {

    const [data, setData] = useState({});

    // const d3Chart = useRef()

    useEffect(() => {
        axios.get("/api/skills-gender", {
            headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }
        }).then((result) => {
            // const maleSkills = {}
            // const femaleSkills = {}
            // const othersSkills = {}
            // const preferNotToSaySkills = {}
            // let hashMap
            // result.data.profile.map((data, index) => {
            //     switch (data.gender) {
            //         case "Male":
            //             hashMap = maleSkills
            //             break;
            //         case "Female":
            //             hashMap = femaleSkills
            //             break;
            //         case "Others":
            //             hashMap = othersSkills
            //             break;
            //         default:
            //             hashMap = preferNotToSaySkills
            //     }
            //     JSON.parse(data.skills).map((skill, index) => {
            //         if (hashMap[skill]) {
            //             hashMap[skill] += 1
            //         } else {
            //             hashMap[skill] = 1
            //         }
            //     })
            //     setData({
            //         male: maleSkills,
            //         female: femaleSkills,
            //         others: othersSkills,
            //         preferNotToSay: preferNotToSaySkills
            //     })
            // })
            // {text: skill, value: amount}
            const maleSkills = { skills: [] }
            const femaleSkills = { skills: [] }
            const othersSkills = { skills: [] }
            const preferNotToSaySkills = { skills: [] }
            const oneSkills = { skills: [] }
            const twoSkills = { skills: [] }
            const threeSkills = { skills: [] }
            const fourSkills = { skills: [] }
            const fiveSkills = { skills: [] }
            const fivePlusSkills = { skills: [] }
            let temp
            console.log(result.data.profile)
            result.data.profile.map((data, index) => {
                switch (data.gender) {
                    case "Male":
                        temp = maleSkills
                        break;
                    case "Female":
                        temp = femaleSkills
                        break;
                    case "Others":
                        temp = othersSkills
                        break;
                    default:
                        temp = preferNotToSaySkills
                }
                JSON.parse(data.skills).map((skill, index) => {
                    if (temp.skills.length === 0) return temp.skills.push({ text: skill, value: 30 })
                    for (let i = 0; i < temp.skills.length; i++) {
                        if (temp.skills[i].text === skill) return temp.skills[i].value += 30
                        else if (i === temp.skills.length - 1) return temp.skills.push({ text: skill, value: 30 })
                    }
                })

                switch (data.yearOfStudy) {
                    case "One":
                        temp = oneSkills
                        break
                    case "Two":
                        temp = twoSkills
                        break
                    case "Three":
                        temp = threeSkills
                        break
                    case "Four":
                        temp = fourSkills
                        break
                    case "Five":
                        temp = fiveSkills
                        break
                    default:
                        temp = fivePlusSkills
                }
                JSON.parse(data.skills).map((skill, index) => {
                    if (temp.skills.length === 0) return temp.skills.push({ text: skill, value: 30 })
                    for (let i = 0; i < temp.skills.length; i++) {
                        if (temp.skills[i].text === skill) return temp.skills[i].value += 30
                        else if (i === temp.skills.length - 1) return temp.skills.push({ text: skill, value: 30 })
                    }
                })
            });
            setData({
                male: maleSkills,
                female: femaleSkills,
                others: othersSkills,
                preferNotToSay: preferNotToSaySkills,
                one: oneSkills,
                two: twoSkills,
                three: threeSkills,
                four: fourSkills,
                five: fiveSkills,
                fivePlus: fivePlusSkills,
            })
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        if (Object.keys(data).length === 0) return;
        console.log(data)
        ReactDOM.render(<WordCloud data={data.male.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('maleSkill'))
        // const arrMale = []
        // const arrFemale = []
        // const arrOthers = []
        // const arrPreferNotToSay = []
        // ReactDOM.render(<WordCloud data={arrMale} width={150} height={100} rotate={0} padding={0} />, document.getElementById('maleSkill'))
        // ReactDOM.render(<WordCloud data={arrFemale} width={150} height={100} rotate={0} padding={0} />, document.getElementById('femaleSkill'))
        // ReactDOM.render(<WordCloud data={arrOthers} width={150} height={100} rotate={0} padding={0} />, document.getElementById('othersSkill'))
        // ReactDOM.render(<WordCloud data={arrPreferNotToSay} width={150} height={100} rotate={0} padding={0} />, document.getElementById('preferNotToSaySkill'))
        // console.log(skills)
        // const margin = {top:50, right:50, bottom:50, left:50}
        // const chartHeight = parseInt(d3.select('#d3demo').style('height')) - margin.top - margin.bottom
        // const chartWidth = parseInt(d3.select('#d3demo').style('width')) - margin.left - margin.right

        // const svg = d3.select(d3Chart.current)
        //     .attr('width', chartWidth + margin.left + margin.right)
        //     .attr('height', chartHeight + margin.top + margin.bottom)

        // const x = d3.scaleBand()
        //     .domain(d3.range(data.length))
        //     .range([magin.left, chartWidth - margin.right])

        // svg.append('g')
        //     .attr('transform', `translate(0, ${chartHeight - margin.bottom})`)
    }, [data])

    return (
        <div>
            <h1>Skills</h1>
            {/* <svg ref={d3Chart}></svg> */}
            <Fragment>
                <div id="maleSkill"></div>
                <div id="femaleSkill"></div>
                <div id="othersSkill"></div>
                <div id="preferNotToSaySkill"></div>
            </Fragment>
        </div>
    )
}

export default SkillsGender