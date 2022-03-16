import React from "react";
import ReactDOM from 'react-dom';
import WordCloud from "react-d3-cloud";
import axios from "axios"
import Cookies from "js-cookie"
import { useState, Fragment, useEffect } from "react"

const VS = () => {
    const [error, setError] = useState(null)
   
  
    useEffect(() => {
      axios
        .get("/api/get-view-skills", { headers: { "X-CSRFTOKEN": Cookies.get("csrftoken") } })
        .then(({ data }) => {
            console.log(data.success.length)
            var j;
            for(var i = 1; i<data.success.length; i++){
              j = JSON.parse(data.success[0].skills).concat(JSON.parse(data.success[i].skills))
            }
            
            var arr =[]
         
            for(var i = 0; i<j.length;i++){
              if(!arr.includes(j[i])){
                arr.push(j[i])
              }
            }

            if (data.success.length> 0) {
              arr = arr.map((skill, index) => ({ text: skill, value: 30}))
              ReactDOM.render(<WordCloud data={arr} width={150} height={100} rotate={0} padding={0} />, document.getElementById('skill'))
            }
            else
                setError("no profiles yet")
        })
        .catch(err => {
            console.error(err)
            setError("no profile yet")
        })
    }, [])
  
  
    return(
      <Fragment>
        <div id="skill"></div>
      </Fragment>
    )
  
  }
  
  
  
  export default VS