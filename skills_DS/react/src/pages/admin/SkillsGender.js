import axios from "axios";
import Cookies from "js-cookie";
import { useState, useEffect, Fragment, useRef } from "react";
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import WordCloud from "react-d3-cloud";

const SkillsGender = () => {

    const [data, setData] = useState({});

    const svgRef = useRef();

    useEffect(() => {
        axios.get("/api/skills-gender", {
            headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }
        }).then((result) => {
            const maleSkills = { skills: [] }
            const femaleSkills = { skills: [] }
            const othersSkills = { skills: [] }
            const preferNotToSaySkills = { skills: [] }
            let temp
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
            });
            setData({
                male: maleSkills,
                female: femaleSkills,
                others: othersSkills,
                preferNotToSay: preferNotToSaySkills,
            })
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    useEffect(() => {
        if (Object.keys(data).length === 0) return;
        ReactDOM.render(<WordCloud data={data.male.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('maleSkill'))
        ReactDOM.render(<WordCloud data={data.female.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('femaleSkill'))
        ReactDOM.render(<WordCloud data={data.others.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('othersSkill'))
        ReactDOM.render(<WordCloud data={data.preferNotToSay.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('preferNotToSaySkill'))

        // Histogram
        const w = 1200;
        const h = 300;

        const svg = d3.select(svgRef.current)
            .attr('width', w)
            .attr('height', h)
            .style('overflow', 'visible')
            .style('margin-top', '75px');

        const xScale = d3.scaleBand()
            .domain(data.male.skills.map((val, i) => val.text))
            .range([0, w])
            .padding(0.9);

        const yScale = d3.scaleLinear()
            .domain([0, h])
            .range([h, 0]);

        const xAxis = d3.axisBottom(xScale)
            .ticks(data.male.skills.length)

        const yAxis = d3.axisLeft(yScale)
            .ticks(5);

        svg.append('g')
            .call(xAxis)
            .attr('transform', `translate(0, ${h})`)
            .selectAll("text")
            .attr('y', 0)
            .attr('x', 9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start');

        svg.append('g')
            .call(yAxis);

        svg.selectAll('.bar')
            .data(data.male.skills)
            .join('rect')
            .attr('x', val => xScale(val.text))
            .attr('y', val => yScale(val.value))
            .attr('width', xScale.bandwidth())
            .attr('height', val => h - yScale(val.value));

    }, [data])

    return (
        <div>
            <Fragment>
                <div>
                    <h2>Male</h2>
                    <div id="maleSkill"></div>
                </div>
                <div>
                    <h2>Female</h2>
                    <div id="femaleSkill"></div>
                </div>
                <div>
                    <h2>Others</h2>
                    <div id="othersSkill"></div>
                </div>
                <div>
                    <h2>PreferNotToSay</h2>
                    <div id="preferNotToSaySkill"></div>
                </div>
            </Fragment>
            <Fragment>
                <svg ref={svgRef}></svg>
            </Fragment>
        </div>
    )
}

export default SkillsGender