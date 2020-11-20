import {makeColChart} from "shared/js/column-chart.js"
import {getUtlas} from "shared/js/get-data.js";


// fetch data
const svg = document.querySelector("#gv-svg-col-chart");
// const timeSpan = document.querySelector("#gv-col-timestamp");

const run = async () => {

  console.log("getutlas", getUtlas)
    const data = await getUtlas();
    console.log("Data", data)
    const utlaData = data.sheets.weekly_cases_est_and_PHE_UTLA;

    
    makeColChart(svg, utlaData, 'confirmedWeeklyNewCases', 'dateOfNewCaseLagged')
    makeColChart(svg, utlaData, 'estimatedWeeklyNewCases', 'dateOfNewCaseLagged')
    
    // const latestDate = engData[0].date;
    // const formatDate = d3.timeFormat("%e %B, %Y");
    // const cleanDate = new Date(latestDate)
    // timeSpan.textContent = formatDate(cleanDate)
  
  
    if (window.resize) {
      window.resize();
    }
  }
run(); 