import React from "react";
import ReactDOM from "react-dom";
import WordCloud from "react-d3-cloud";

function WC(){
    const element = (
        <div>
          <h1>Hello, world!</h1>
          <h2>It is {new Date().toLocaleTimeString()}.</h2>
        </div>
      );
      ReactDOM.render(element, document.getElementById('root'));
};



export default WC