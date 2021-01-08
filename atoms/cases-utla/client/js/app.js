import {makeColChart} from "shared/js/column-chart.js"
import {getUtlas} from "shared/js/get-data.js";

const svgBoxes = document.querySelectorAll('.multiple');

const isWide = window.innerWidth > 450;
const width = 275 
const height = 250

// should we pick the ones with the biggest gap? or the highest estimated rate? 
// places 
// const liverpool = {code: "E08000012", name: "Liverpool"}
// const tameside = {code: "E08000008", name: "Tameside"}
// const manchester = {code: "E08000003", name: "Manchester"}
// const salford = {code: "E08000006", name: "Salford"}
// const rochdale = {code: "E08000005", name: "Rochdale"}
// const oldham = {code: "E08000004", name: "Oldham"}


const barking = {code: "E09000002", name: "Barking and Dagenham"}
const newham = {code: "E09000025", name: "Newham"}
const thurrock = {code: "E06000034", name: "Thurrock"}
const redbridge = {code: "E09000026", name: "Redbridge"}
const havering = {code: "E09000016", name: "Havering"}
const towerHamlets = {code: "E09000030", name: "Tower Hamlets"}


const areas = [barking, newham, thurrock, redbridge, havering, towerHamlets];

const makeUtlaChart = (svgBox, utlaData, utlaName) => {
  svgBox.querySelector('#utla-name').textContent = utlaName;
  const svg = svgBox.querySelector(".gv-svg-col-chart-est-utla");
  const infoSpans = svgBox.querySelectorAll(".info-box span");
  const config = {width, height}
  makeColChart(svg, infoSpans, utlaData, config, true, isWide)
}


const run = async () => {
  // fetch data
  const data = await getUtlas();
  const allData = data.sheets.weekly_cases_est_and_PHE_UTLA;

  // create graph for each area 
  areas.map((area, i) => {
    const areaData = allData.filter(d => {
      return d.utlaCode === area.code
    });
    makeUtlaChart(svgBoxes[i], areaData, area.name)
  })

  if (window.resize) {
    window.resize();
  }
}


run(); 