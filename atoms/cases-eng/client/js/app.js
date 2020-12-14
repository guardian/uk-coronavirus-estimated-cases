import {makeColChart} from "shared/js/column-chart.js"
import {getUtlas} from "shared/js/get-data.js";
import moment from "moment";

// DATA IN
// {
    // IFR: "0.004266902959"
    // confirmedWeeklyNewCases: 0
    // confirmedWeeklyNewCasesRate: "0"
    // dateOfNewCaseLagged: Date Mon Dec 16 2019 00:00:00 GMT+0000 (Greenwich Mean Time)
    // deathDate: "3/1/2020"
    // estimatedWeeklyNewCases: "0"
    // estimatedWeeklyNewCasesRate: "0"
    // population: "353134"
    // region: "London"
    // utlaCode: "E09000025"
    // utlaName: "Newham"
    // weeklyDeaths: "0"
// }


// DATA OUT
// {
    // dateOfNewCaseLagged: Date Mon Dec 16 2019 00:00:00 GMT+0000 (Greenwich Mean Time)
    // confirmedWeeklyNewCases: 0
    // estimatedWeeklyNewCases: "0"
    // weeklyDeaths: "0"
    // population: "353134"
    // utlaCode: "E92000001"
    // utlaName: "England"
// }

const svg = document.querySelector(".gv-svg-col-chart-est");
const infoSpans = document.querySelectorAll(".info-box span");

const isWide = window.innerWidth > 450;
const width = isWide ? 600 : 300;
const height = isWide ? 400 : 200;

const compressArray = (dateArr) => {
  return dateArr.reduce((acc, curr) => {
    const wkConf = parseInt(curr['confirmedWeeklyNewCases']) 
    const wkEst = parseInt(curr['estimatedWeeklyNewCases']);
    const pop = parseInt(curr['population'].replace(",", ""))
    const wkD = parseInt(curr['weeklyDeaths']);

    const wkConfClean = (Number.isNaN(wkConf) ? 0 : wkConf)
    const wkEstClean = (Number.isNaN(wkEst) ? 0 : wkEst)
    const populationClean = (Number.isNaN(pop) ? 0 : pop)
    const wkDClean = (Number.isNaN(wkD) ? 0 : wkD)

    let {confirmedWeeklyNewCases, estimatedWeeklyNewCases, population, weeklyDeaths} = acc;
    confirmedWeeklyNewCases = (confirmedWeeklyNewCases ? confirmedWeeklyNewCases : 0) + wkConfClean;
    estimatedWeeklyNewCases = (estimatedWeeklyNewCases ? estimatedWeeklyNewCases : 0) + wkEstClean;
    population = (population ? population : 0) + populationClean;
    weeklyDeaths = (weeklyDeaths ? weeklyDeaths : 0) + wkDClean;
    
    return {
      ...acc, 
      confirmedWeeklyNewCases, 
      estimatedWeeklyNewCases, 
      population,
      weeklyDeaths, 
      dateOfNewCaseLagged: curr['dateOfNewCaseLagged'],
      utlaCode:"E92000001",
      utlaName: "England"
    }
  }, {})
}

// convert data for all areas into england level data 
const getSumForDate = (allData) => {

  //all data should use dates in a consistent format eg: not 06/01/2020 AND 6/1/2020
  const cleanDates = allData.map(d => {
    const dc = moment(d['dateOfNewCaseLagged'], "DD/MM/YYYY");
    const clean = dc.format('DD/MM/YYYY')
    return {...d, 'dateOfNewCaseLagged': clean};
  })

  //split into 2d arrays by date 
  const uniqDates = Array.from(new Set(cleanDates.map(d => d['dateOfNewCaseLagged']))) // check in spreadsheet that dates are formatted in one way only
  const splitByDate = uniqDates.map(date => cleanDates.filter(d => d['dateOfNewCaseLagged'] === date))
  const compressToEngland = splitByDate.map(d => compressArray(d));

  return compressToEngland;
}

const run = async () => {
    // fetch data
    const data = await getUtlas();
    const allData = data.sheets.weekly_cases_est_and_PHE_UTLA;
    //sort by date and sum all england for each date 
    const summedByDate = getSumForDate(allData);
    const config = {width, height};
    makeColChart(svg, infoSpans, summedByDate, config, false, isWide)
  
    if (window.resize) {
      window.resize();
    }
  }
run(); 