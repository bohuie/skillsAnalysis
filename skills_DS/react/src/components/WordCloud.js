import React from "react";
import ReactDOM from 'react-dom';
import WordCloud from "react-d3-cloud";
import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"

const WC = () => {
  const[jobTitles,setjobTitles] = useState([])
  const[job,setJob] = useState(null)
  const [error, setError] = useState(null)
  const [profession,setProfession] = useState(null)
 

  const submit = e => {
    var data;
    e.preventDefault();
    axios
      .post("/api/get-job-skills",{job}, { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") }})
      .then((s) => {
        data = s.data.skills.map(({name,count}) => ({text: name, value: count}))
        ReactDOM.render(<div id="root"><WordCloud data={data} width={200} height={200} rotate={0} padding={0} /></div>, document.getElementById('render'))
      })
      .catch(err => {
        console.error(err)
        setError("unable to get data")
      })
  };

  useEffect(() => {
    axios
        .get("/api/get-job-titles", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
        .then(({ data }) => {
          setjobTitles(data.title)
        })
        .catch(err => {
          console.error(err)
          setError("database is empty")
      })
  }, [])

  useEffect(() => {
    axios
      .get("/api/get-profile", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
      .then(({ data }) => {
          var z;
          console.log(data.success.skills.length)
          if (data.success.skills.length > 2) {
            z = JSON.parse(data.success.skills).map((skill, index) => ({ text: skill, value: 100}))
            ReactDOM.render(<WordCloud data={z} width={150} height={100} rotate={0} padding={0} />, document.getElementById('skill'))
          }
          else
              setError("no profile yet")
      })
      .catch(err => {
          console.error(err)
          setError("no profile yet")
      })
  }, [])

 const handleChange = (e) => {
    setProfession(e.target.value)
    setJob(e.target.value)
  }

  return(
    <Fragment>
      <div className= "dropdown" >
        <form onSubmit={submit} style={{ display:"flex"}}>
          <div className="form">
            <select name="profession" value= {profession} className="form-control w-100" onChange={handleChange}>
              <option disabled selected value> select an option </option>
              {
                jobTitles.map((title)=>{
                  return(
                    <option  value={title.name} key = {title.id}>{title.name}</option>
                  )
                })
              }
            </select>
          </div>
          <div className="button">
            <button type="submit" className="btn btn-primary" disabled = {!profession}>Enter</button>
          </div>
        </form>
      </div>
      <div id="render" ></div>
      <h1>Your skills: {error}</h1>
      <div id="skill"></div>
    </Fragment>
  )

}



export default WC