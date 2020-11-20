import * as d3 from "d3";
import moment from "moment"

// line chart showing uk total over time 

// DATA FORMAT 
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

const w = 500;
const h = 350;
const isWide = window.innerWidth > 450;
const dateFormat = "D/M/YYYY"

const margin = {top: 5, left: 15, bottom: 5, right: 5};
const sumBoxW = w / 6;
const sumBoxH = h / 6;
const confColor = "#c70000";
const estColor = "grey";
const startDate = new Date(moment("16/12/2019", dateFormat));

const calculatePercentInfected = (data, casesProp) => {
    const totalCases = data.reduce((acc, curr) => acc += curr[casesProp], 0)
    const population = parseInt(data[0].population);
    return ((totalCases / population) * 100).toFixed(1);
}

const cleanUpData = (data, dateProp, estCasesProp, confCasesProp) => {
    //reverse dates 
    const datesRev = data.sort( (a,b) => moment(a[dateProp], dateFormat) - moment(b[dateProp], dateFormat))

    //convert cases string to number
    const dataAsNum = datesRev.map(d => {
        const estCasesNum = parseInt(d[estCasesProp], 10);
        const confCasesNum = parseInt(d[confCasesProp],10)
        const dateClean = new Date(moment(d[dateProp], dateFormat))
        return {...d, [estCasesProp]: estCasesNum, [confCasesProp]: confCasesNum, [dateProp]: dateClean }
    })

    return dataAsNum;
}

const makeColChart = (svgEl, rawData, estCasesProp, confCasesProp, dateProp) => {
    const svg = d3.select(svgEl)

    const dataToUse = cleanUpData(rawData, dateProp, estCasesProp, confCasesProp);

    const maxCases = d3.max(dataToUse.map(d => d[estCasesProp]));
    const maxDate = d3.max(dataToUse.map(d => new Date(d[dateProp])));
    const minDate = startDate;

    const estPercentInfected = calculatePercentInfected(dataToUse, estCasesProp)
    const confPercentInfected = calculatePercentInfected(dataToUse, confCasesProp)


    // SCALES 
    const yScale = d3.scaleLinear()
        .domain([0, maxCases])
        .range([h - margin.top - margin.bottom, 0]);

    const xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, w - margin.left - margin.right])

    const xScaleCol = d3.scaleBand()
        .domain(dataToUse.map(d => new Date(d[dateProp])))    // min to max 
        .range([0, w - margin.left - margin.right])
        .padding(0.05)


    // AXES 
    const xAxis = d3.axisBottom(xScale)
        .scale(xScale)
        .tickSize(isWide ? 5 : 10 )
        .tickFormat(d3.timeFormat("%b"))

    const yAxis = d3.axisRight(yScale)
        .scale(yScale)
        .tickSize(w - margin.left)
        .ticks(8)

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left},${h - 15})`) //sorry shouldn't need to do this 
        .call(xAxis)
        .select(".domain").remove()

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left},${-margin.top})`)
        .call(yAxis)
        .select(".domain").remove()
    
    d3.selectAll('.y .tick text')
      .attr('transform', `translate(${-w},${isWide ? -7 : -12} )`)

    d3.selectAll('.y .tick line')
        .style("stroke-dasharray", ("1, 1"))
    
    //move first x tick over on mobile
    d3.select('.x .tick text')
      .attr("dx", isWide ? 0 : 10)

    // COLUMNS ESTMATED 
    svg.selectAll(".col-est")
        .data(dataToUse)   
        .join("rect")
        .attr("class", "col-est")
        .attr("fill", `${estColor}`)
        .attr("width", xScaleCol.bandwidth())
        .attr("height", (d,i) => {
            return h - margin.top - margin.bottom - yScale(d[estCasesProp]);
        })
        .attr("transform", (d) => {
            return `translate(${xScaleCol(d[dateProp])},0)`
        })
        .attr("y", d => yScale(d[estCasesProp]) - margin.top) //??
        .style("opacity", 0.5)

    // COLUMNS CONFIRMED 
    svg.selectAll(".col-conf")
        .data(dataToUse)   
        .join("rect")
        .attr("class", "col-conf")
        .attr("fill", `${confColor}`)
        .attr("width", xScaleCol.bandwidth())
        .attr("height", (d,i) => {
            return h - margin.top - margin.bottom - yScale(d[confCasesProp]);
        })
        .attr("transform", (d) => {
            return `translate(${xScaleCol(d[dateProp])},0)`
        })
        .attr("y", d => yScale(d[confCasesProp]) - margin.top)
        .style("opacity", 0.5)

    // SUMMARY BOX 
    const summaryBox = svg.append("g")
        .attr("id", "summary-box")
        .attr("transform", `translate(${w -sumBoxW},${margin.top})`)

    summaryBox.append("text")
        .text(`people infected:`)
        .append("text")

    summaryBox.append("text")
        .text(`${confPercentInfected}% confirmed`)
        .attr("dy", "20")

    summaryBox.append("text")
        .text(` ${estPercentInfected}% estimated`)
        .attr("dy", "40")
        // .append("rect")
        // .attr("height", sumBoxH )
        // .attr("width", sumBoxW )
        // .attr("fill", "red")

}

export {makeColChart}