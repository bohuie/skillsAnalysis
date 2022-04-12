import axios from "axios";
import Cookies from "js-cookie";
import { useState, useEffect, Fragment, useRef } from "react";
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import WordCloud from "react-d3-cloud";

const SkillsGender = () => {

    const [data, setData] = useState();
    const [newData, setNewData] = useState([]);
    const [filter, setFilter] = useState("Male");
    const [filter2, setFilter2] = useState("");

    const svgRef = useRef();

    useEffect(() => {
        axios.get("/api/skills-gender", {
            headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }
        }).then((result) => {
            const maleSkills = { skills: [] }
            const femaleSkills = { skills: [] }
            const othersSkills = { skills: [] }
            const preferNotToSaySkills = { skills: [] }
            const WORD_CLOUD_INCREMENT = 5
            let temp
            let temp2 = []
            let tempNum
            result.data.profile.map((data, index) => {
                switch (data.gender) {
                    case "Male":
                        temp = maleSkills
                        tempNum = 0
                        break;
                    case "Female":
                        temp = femaleSkills
                        tempNum = 1
                        break;
                    case "Other":
                        temp = othersSkills
                        tempNum = 2
                        break;
                    default:
                        temp = preferNotToSaySkills
                        tempNum = 3
                }
                Object.values(JSON.parse(data.skills)).pop().map((skill, index) => {
                    if (temp.skills.length === 0) return temp.skills.push({ text: skill, value: WORD_CLOUD_INCREMENT })
                    for (let i = 0; i < temp.skills.length; i++) {
                        if (temp.skills[i].text === skill) return temp.skills[i].value += WORD_CLOUD_INCREMENT
                        else if (i === temp.skills.length - 1) return temp.skills.push({ text: skill, value: WORD_CLOUD_INCREMENT })
                    }
                })

                // histogram data
                Object.values(JSON.parse(data.skills)).pop().map((skill, index) => {
                    if (temp2.length === 0) {
                        temp2.push({
                            category: skill,
                            total: 1,
                            values: [
                                { value: 0, group: "male" },
                                { value: 0, group: "female" },
                                { value: 0, group: "others" },
                                { value: 0, group: "prefer not to say" }
                            ]
                        })
                        temp2[0].values[tempNum].value += 1
                        return
                    }
                    for (let i = 0; i < temp2.length; i++) {
                        if (temp2[i].category === skill) {
                            temp2[i].values[tempNum].value += 1
                            temp2[i].total += 1
                            return
                        } else if (i === temp2.length - 1) {
                            temp2.push({
                                category: skill,
                                total: 1,
                                values: [
                                    { value: 0, group: "male" },
                                    { value: 0, group: "female" },
                                    { value: 0, group: "others" },
                                    { value: 0, group: "prefer not to say" }
                                ]
                            })
                            temp2[temp2.length - 1].values[tempNum].value += 1
                            return
                        }
                    }

                })
            });
            setData({
                male: maleSkills,
                female: femaleSkills,
                others: othersSkills,
                preferNotToSay: preferNotToSaySkills,
            })
            setNewData(temp2)
        }).catch((error) => {
            console.error(error)
        })
    }, [])

    useEffect(() => {
        if (newData.length === 0) return
        let filteredData = newData
        if (filter2 && filter2 > 0) {
            const topNum = parseInt(filter2)
            // const temp = filteredData.filter((d) => d.values.some((e) => e.value >= topNum))
            const temp = filteredData.sort((a, b) => b.total - a.total).slice(0, topNum)
            filteredData = temp.length === 0 ? newData : temp
        }
        const margin = { top: 50, right: 5, bottom: 200, left: 30 }
        const width = 1200 - margin.left - margin.right
        const height = 600 - margin.top - margin.bottom

        const x0 = d3.scaleBand().rangeRound([0, width], .5);
        const x1 = d3.scaleBand();
        const y = d3.scaleLinear().rangeRound([height, 0]);

        const xAxis = d3.axisBottom().scale(x0)
            .tickValues(filteredData.map(d => d.category))

        const yAxis = d3.axisLeft().scale(y);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const categoriesNames = filteredData.map((d) => d.category);
        const groupNames = filteredData[0].values.map((d) => d.group);

        x0.domain(categoriesNames);
        x1.domain(groupNames).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(filteredData, (category) => { return d3.max(category.values, (d) => { return d.value; }); })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr('y', 0)
            .attr('x', 9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start');


        svg.append("g")
            .attr("class", "y axis")
            .style('opacity', '0')
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .style('font-weight', 'bold')
            .text("Value");

        svg.select('.y').transition().duration(500).delay(1300).style('opacity', '1');

        const slice = svg.selectAll(".slice")
            .data(filteredData)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", (d) => "translate(" + x0(d.category) + ",0)");

        slice.selectAll("rect")
            .data((d) => d.values)
            .enter().append("rect")
            .attr("width", x1.bandwidth())
            .attr("x", (d) => x1(d.group))
            .style("fill", (d) => color(d.group))
            .attr("y", (d) => y(0))
            .attr("height", (d) => height - y(0))

        slice.selectAll("rect")
            .transition()
            .delay((d) => Math.random() * 1000)
            .duration(1000)
            .attr("y", (d) => y(d.value))
            .attr("height", (d) => height - y(d.value));

        //Legend
        const legend = svg.selectAll(".legend")
            .data(filteredData[0].values.map((d) => d.group).reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")")
            .style("opacity", "0");

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", (d) => color(d));

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text((d) => d);

        legend.transition().duration(500).delay((d, i) => 1300 + 100 * i).style("opacity", "1");

    }, [newData, filter2])

    useEffect(() => {
        if (!filter) return
        if (!data) return
        switch (filter) {
            case 'Male':
                ReactDOM.render(<WordCloud data={data.male.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('cloud'))
                break
            case 'Female':
                ReactDOM.render(<WordCloud data={data.female.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('cloud'))
                break
            case 'Others':
                ReactDOM.render(<WordCloud data={data.others.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('cloud'))
                break
            default:
                ReactDOM.render(<WordCloud data={data.preferNotToSay.skills} width={150} height={100} rotate={0} padding={0} />, document.getElementById('cloud'))
        }
    }, [data, filter])

    return (
        <>
            <h1 style={{
                textAlign: "center",
                color: "black"
            }}>Word Cloud</h1>
            <div style={{
                display: "flex",
                justifyContent: "space-evenly",
            }}>
                <button className="btn btn-success" onClick={() => setFilter("Male")}>
                    Male
                </button>
                <button className="btn btn-success" onClick={() => setFilter("Female")}>
                    Female
                </button>
                <button className="btn btn-success" onClick={() => setFilter("Others")}>
                    Others
                </button>
                <button className="btn btn-success" onClick={() => setFilter("Prefer not to say")}>
                    Prefer not to say
                </button>
            </div>
            <Fragment>
                <div>
                    <h2 style={{ textAlign: "center" }}>{filter}</h2>
                    <div id="cloud"></div>
                </div>
            </Fragment>
            <h1 style={{
                textAlign: "center",
                color: "black"
            }}>Histogram</h1>
            <input className="form-control" type="number" placeholder="Top Filter" onChange={(e) => { setFilter2(e.target.value) }}></input>
            <Fragment>
                <svg ref={svgRef} key={filter2}></svg>
            </Fragment>
        </>
    )
}

export default SkillsGender