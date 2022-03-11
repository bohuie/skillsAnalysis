import React from "react";
import ReactDOM from 'react-dom';
import WordCloud from "react-d3-cloud";
import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"

const WC = props =>{
  const[enter,setEnter] = useState(false)
  const[jobTitles,setjobTitles] = useState([])
  const[job,setJob] = useState(null)
  const[skills,setSkills] = useState([])
  const[error,setError] = useState(null)
  var data;
  const submit = e => {
    e.preventDefault();
    axios
      .post("/api/get-job-skills",{job}, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }})
      .then((s) => {
        data = s.data.skills.map(({name,count}) => ({text: name, value: count}))
        ReactDOM.render(<div id="root"><WordCloud data={data} /></div>, document.getElementById('render'))
      })
      .catch(err => {
        console.error(err, err?.response, err?.response?.data)
        setError("bad request")
      })
  };

  useEffect(() => {
    axios
        .get("/api/get-job-titles", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
        .then(({ data }) => {
          //console.log(data)
          setjobTitles(data.title)
          //console.log(jobTitles)
        })
  }, [])

   useEffect(() => {
    axios
      .get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then(({ data }) => {
          console.log(data);
          const y = 100
          var z;
          if (data.success) {
              //console.log(data.success.skills)
              z = JSON.parse(data.success.skills).map((skill, index) => ({ text: skill, value: 100}))
              //setSkills(JSON.parse(data.success.skills).map(({name,y}) => ({text: name, value: y})));
              ReactDOM.render(<WordCloud data={z} />, document.getElementById('skill'))
            }
          else
              setError("Unable to get data.")
      })
      .catch(err => {
          console.error(err)
          setError("Unable to get data.")
      })
  }, [])

  return(
    <Fragment>
      <div className= "dropdown" >
        <form onSubmit={submit} >
          <select className="form-control w-50" onChange={e => setJob(e.target.value) }>
            <option disabled selected value> select an option </option>
            {
              jobTitles.map((title)=>{
                return(
                  <option  value={title.name} key = {title.id}>{title.name}</option>
                )
              })
            }
          </select>
          <button type="submit" className="btn btn-primary">Enter</button>
        </form>
      </div>
      <div id="render" ></div>
      <h1>Your skills</h1>
      <div id="skill"></div>
      
    </Fragment>
  )

}



export default WC