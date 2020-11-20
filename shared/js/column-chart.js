import * as d3 from "d3";
import {getAllDataLastXDays} from "shared/js/helpers.js"
import moment from "moment"

// line chart showing uk total over time 

// DATA FORMAT 
// {
    // areaCode: "K02000001"
    // areaType: "overview"
    // date: "2020-03-27"
    // hospitalCases: 7043
    // name: "United Kingdom"
    // newCases: 2890
    // newDeaths: 288
    // newPillarFourTests: null
    // newPillarOneTests: null
    // newPillarThreeTests: null
    // newPillarTwoTests: null
    // newTestsAll: null
    // totalCases: 14548
    // totalDeaths: 1172
// }

const w = 600;
const h = 375;
const isWide = window.innerWidth > 450;
const dateFormat = "YYYY-MM-DD"

const margin = {top: 5, left: 15, bottom: 5, right: 5};
const startDate = moment(new Date("1 March, 2020")); 

const cleanUpData = (data) => {
    //reverse dates 
    const datesRev = data.sort( (a,b) => moment(a[dateProp], dateFormat) - moment(b[dateProp], dateFormat))
    //remove before 1st March
    const afterMarch = datesRev.filter(d => moment(d[dateProp], dateFormat) > startDate)
    return afterMarch;
}

const sevenDayAverageData = (data, propName) => {
    const mostRecentDate = data.slice(-1)[0][dateProp];
    const latestDate = moment(mostRecentDate, dateFormat);

    let periodsOf7Days = []; 
    data.forEach((d, i) => {
        if(i % 7 === 0) { periodsOf7Days.push(i)}
    })
    
    const datesEvery7Days = periodsOf7Days.map(p => {
        return moment(mostRecentDate, dateFormat).subtract(p, 'days')
    });

    // returns 2d array with each 7 day period in inner array
    const dataForEach7Period = datesEvery7Days.map(d => {
        return getAllDataLastXDays(data, d, 7)
    })

    // sum the data in each period
    const dataSummed = dataForEach7Period.reduce((acc, curr) => {
        
        const dataSum = curr.reduce((a, c) => { 
            const num = c[propName] ? c[propName] : 0;
            a += num;
            return a; 
        }, 0); 
        const midDate = curr.slice(-3)[0][dateProp];
        const aveObj = {date: midDate, ave: parseInt(dataSum / 7)}
        return [... acc, aveObj];
    },[])

    return dataSummed;
 }



const makeColChart = (svgEl, rawData, casesProp, dateProp) => {
    const svg = d3.select(svgEl)

    const dataToUse = cleanUpData(rawData);
    const aveData = sevenDayAverageData(dataToUse, casesProp);

    const maxCases = d3.max(data.map(d => d[casesProp]));
    const maxDate = d3.max(data.map(d => new Date(d[dateProp])));
    const minDate = startDate;


    // SCALES 
    const yScale = d3.scaleLinear()
        .domain([0, maxCases])
        .range([h - margin.top - margin.bottom, 0]);

    const xScale = d3.scaleTime()
        .domain([minDate, maxDate])
        .range([0, w - margin.left - margin.right])

    const xScaleCol = d3.scaleBand()
        .domain(data.map(d => d[dateProp]))    // min to max 
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

    // COLUMNS 
    svg.selectAll(".col")
        .data(dataToUse)   
        .join("rect")
        .attr("class", "col")
        .attr("fill", "#c70000")
        .attr("width", xScaleCol.bandwidth())
        .attr("height", (d) => {
            return h - margin.top - margin.bottom - yScale(d[casesProp]);
        })
        .attr("transform", (d) => {
            return `translate(${xScaleCol(d[dateProp]) + margin.left},0)`
        })
        .attr("y", d => yScale(d[casesProp]) - margin.top) //??
        .style("opacity", 0.3)

    // LINE
    // svg.append("path")
    //     .attr("class", "line")
    //     .datum(aveData)
    //     .attr("fill", "none")
    //     .attr("stroke", "#c70000")
    //     .attr("stroke-width", isWide ? 1.5 : 3)
    //     .attr("d", d3.line()
    //         .curve(d3.curveBasis)
    //         .x(function(d) { 
    //             return xScale(new Date(d[dateProp])) + margin.left
    //         })
    //         .y(function(d) { 
    //             return yScale(d.ave) - margin.top
    //         })
    //         )

    // LATEST CASES LABEL
    // const lastDataPoint = dataToUse[dataToUse.length -1];

    // svg.append("text")
    //     .text(lastDataPoint[casesProp].toLocaleString("en-gb"))
    //     .attr('class', 'cases-last-number')
    //     .attr("x", xScale(new Date(lastDataPoint[dateProp])) + margin.left)
    //     .attr("y", yScale(lastDataPoint[casesProp]))
    //     .attr("text-anchor", "end")
    //     // .attr("dx", isWide ? 5 : -5)
    //     .attr("dy", isWide ? -30 : -35)

    // // add a line to connect the number with the column 
    // svg.append("line")
    //     .attr('class', 'cases-last-number-line')
    //     .attr("stroke", "#929297")
    //     .attr("stroke-width", isWide ? 0.5 : 1)
    //     .attr("x1", xScale(new Date(lastDataPoint[dateProp])) + margin.left - xScaleCol.bandwidth()/2 )
    //     .attr("x2", xScale(new Date(lastDataPoint[dateProp])) + margin.left - xScaleCol.bandwidth()/2)
    //     .attr("y1", yScale(lastDataPoint[casesProp]) - margin.top)
    //     .attr("y2", yScale(lastDataPoint[casesProp] - margin.top) - (isWide ? 28 : 32))

    // svg.append("circle")
    //     .attr('class', 'cases-last-number-circle')
    //     .attr('fill', '#880105')
    //     .attr("r", isWide ? 3 : 5)
    //     .attr("cx", xScale(new Date(lastDataPoint[dateProp])) + margin.left - xScaleCol.bandwidth()/2 )
    //     .attr("cy", yScale(lastDataPoint[casesProp]) - margin.top)

    
}

export {makeColChart}