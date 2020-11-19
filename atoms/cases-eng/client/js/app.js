// if you want to import a module from shared/js then you can
// just do e.g. import Scatter from "shared/js/scatter.js"
import * as d3 from "d3";
import {makeColChart} from "shared/js/column-chart.js"
import {getNations} from "shared/js/get-data.js";

// fetch data
const svg = document.querySelector("#gv-svg-col-chart");
const timeSpan = document.querySelector("#gv-col-timestamp");

const run = async () => {
    const ukData = await getNations();
    const engData = ukData.filter(d => d.name === "England");

    console.log("engdata --->", engData)
    
    makeColChart(svg, engData, 'newCases')
    
    // const latestDate = engData[0].date;
    // const formatDate = d3.timeFormat("%e %B, %Y");
    // const cleanDate = new Date(latestDate)
    // timeSpan.textContent = formatDate(cleanDate)
  
  
    if (window.resize) {
      window.resize();
    }
  }
run(); 