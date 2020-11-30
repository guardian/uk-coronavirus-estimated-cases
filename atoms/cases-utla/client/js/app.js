import {makeColChart} from "shared/js/column-chart.js"
import {getUtlas} from "shared/js/get-data.js";

const svgBoxes = document.querySelectorAll('.multiple');
const infoSpans = document.querySelectorAll(".info-box span");

// should we pick the ones with the biggest gap? or the highest estimated rate? 
// places 
const brent = {code: "E09000005", name: "Brent"}
const newham = {code: "E09000025", name: "Newham"}
const tameside = {code: "E08000008", name: "Tameside"}
const liverpool = {code: "E08000012", name: "Liverpool"}
const salford = {code: "E08000006", name: "Salford"}
const harrow = {code: "E09000015", name: "Harrow"}

const areas = [brent, newham, tameside, liverpool, salford, harrow];


const makeUtlaChart = (svgBox, utlaData, utlaName) => {
  svgBox.querySelector('#utla-name').textContent = utlaName;
  const svg = svgBox.querySelector("#gv-svg-col-chart");
  const infoSpans = svgBox.querySelectorAll(".info-box span");
  makeColChart(svg, infoSpans, utlaData, 'estimatedWeeklyNewCases', 'confirmedWeeklyNewCases', 'dateOfNewCaseLagged')
}


const run = async () => {
  // fetch data
  const data = await getUtlas();
  const allData = data.sheets.weekly_cases_est_and_PHE_UTLA;
  
  // create graph for each area 
  areas.map((area, i) => {
    const areaData = allData.filter(d => d.utlaCode === area.code);
    makeUtlaChart(svgBoxes[i], areaData, area.name)
  })

  if (window.resize) {
    window.resize();
  }
}


run(); 