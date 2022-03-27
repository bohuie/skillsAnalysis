import axios from "axios";
import Cookies from "js-cookie";
import { useState, useEffect, Fragment } from "react";
import ReactDOM from 'react-dom';
import d3 from 'd3';
import WordCloud from "react-d3-cloud";

const SkillsYear = () => {

    const [data, setData] = useState({});

    // const d3Chart = useRef()

    useEffect(() => {
        axios.get("/api/skills-gender", {
            headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }
        }).then((result) => {
            const oneSkills = { skills: [] }
            const twoSkills = { skills: [] }
            const threeSkills = { skills: [] }
            const fourSkills = { skills: [] }
            const fiveSkills = { skills: [] }
            const fivePlusSkills = { skills: [] }
            let temp
            result.data.profile.map((data, index) => {
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
        ReactDOM.render(<WordCloud data={data.one.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('oneSkill'))
        ReactDOM.render(<WordCloud data={data.two.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('twoSkill'))
        ReactDOM.render(<WordCloud data={data.three.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('threeSkill'))
        ReactDOM.render(<WordCloud data={data.four.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('fourSkill'))
        ReactDOM.render(<WordCloud data={data.five.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('fiveSkill'))
        ReactDOM.render(<WordCloud data={data.fivePlus.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('fivePlusSkill'))
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
            {/* <svg ref={d3Chart}></svg> */}
            <Fragment>
                <div>
                    <h2>1st Year</h2>
                    <div id="oneSkill"></div>
                </div>
                <div>
                    <h2>2nd Year</h2>
                    <div id="twoSkill"></div>
                </div>
                <div>
                    <h2>3rd Year</h2>
                    <div id="threeSkill"></div>
                </div>
                <div>
                    <h2>4th Year</h2>
                    <div id="fourSkill"></div>
                </div>
                <div>
                    <h2>5th Year</h2>
                    <div id="fiveSkill"></div>
                </div>
                <div>
                    <h2>5+ Year</h2>
                    <div id="fivePlusSkill"></div>
                </div>
            </Fragment>
        </div>
    )
}

export default SkillsYear