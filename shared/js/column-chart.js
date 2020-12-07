import * as d3 from "d3";
import { easeCubicInOut, easeCubicOut } from "d3";
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

const isWide = window.innerWidth > 450;
const dateFormat = "D/M/YYYY"
const estCasesProp = 'estimatedWeeklyNewCases'; 
const confCasesProp = 'confirmedWeeklyNewCases';
const dateProp = 'dateOfNewCaseLagged';

const margin = {top: 5, left: 15, bottom: 10, right: 5};
const confColor = "#c70000";
const estColor = "grey";
const startDate = new Date(moment("16/12/2019", dateFormat));


let isIntersectionObserverAvailable = true;

if (!('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !('intersectionRatio' in window.IntersectionObserverEntry.prototype)) {
        isIntersectionObserverAvailable = false;
}

const intersectionOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.9
  }


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

const animateBars = (estCols, yScale, h, estSpan, estValue) => {
    // add transition to each bar 
    const numCols = estCols._groups[0].length;

    estCols.transition()
        .duration(300)
        .ease(easeCubicInOut)
        .delay((_,i) => i * 150)
        .attr("height", (d) => h - margin.top - margin.bottom - yScale(d[estCasesProp]))
        .attr("y", d => yScale(d[estCasesProp]))

    estSpan.transition()
        .duration((numCols -10) * 150)
        .delay(150 * 10)
        .ease(easeCubicOut)
        .textTween(() => {
            let interpolator = d3.interpolateNumber(0.0, estValue);
            return (t) => {
                return `${parseFloat(interpolator(t)).toFixed(1)}%`;
            }
        });
}


const makeColChart = (svgEl, infoBoxes, rawData, config, isMultiple) => {
    const svg = d3.select(svgEl)
    const {w, h} = config;
    let hasAnimationRun = false;

    //set svg width and viewbox 
    svg.attr("width", w)
    .attr("height", h)
    .attr("viewBox", `0,0,${w},${h}`)

    const dataToUse = cleanUpData(rawData, dateProp, estCasesProp, confCasesProp);

    const maxCases = d3.max(dataToUse.map(d => d[estCasesProp]));
    const maxDate = d3.max(dataToUse.map(d => new Date(d[dateProp])));
    const minDate = startDate;

    const estPercentInfected = calculatePercentInfected(dataToUse, estCasesProp)
    const confPercentInfected = calculatePercentInfected(dataToUse, confCasesProp)

    infoBoxes[1].textContent = `${confPercentInfected}%`;
    const estSpan = d3.select(infoBoxes[0]);

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
        .ticks(4)

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${margin.left},${ h - margin.bottom - margin.top})`) //sorry shouldn't need to do this 
        .call(xAxis)
        .select(".domain").remove()

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .select(".domain").remove()
    
    d3.selectAll('.y .tick text')
      .attr('transform', `translate(${-w},${isWide ? -7 : -12} )`)

    d3.selectAll('.y .tick line')
        .style("stroke-dasharray", ("1, 1"))
    
    //move first x tick over on mobile
    // d3.select('.x .tick text')
    //   .attr("dx", isWide ? 0 : 10)

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
        .attr("y", d => yScale(d[confCasesProp]))
        .style("opacity", 0.5)


    // COLUMNS ESTMATED 
    const estCols = svg.selectAll(".col-est")
        .data(dataToUse)   
        .join("rect")
        .attr("class", "col-est")
        .attr("fill", `${estColor}`)
        .attr("width", xScaleCol.bandwidth())
        .attr("transform", (d) => {
            return `translate(${xScaleCol(d[dateProp])},0)`
        })
        .attr("y", h - margin.top - margin.bottom) //?? hate this margin thing
        .style("opacity", 0.5)
        .attr("height", 0)


    if(isIntersectionObserverAvailable) {
        // add transition to each bar WHEN fully onscreen
        const intersectionCallback = (entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting && !hasAnimationRun) {
                    animateBars(estCols, yScale, h, estSpan, estPercentInfected)
                    hasAnimationRun = true; 

                }

            });
        };
        const observer = new IntersectionObserver( intersectionCallback, intersectionOptions);
        observer.observe(svgEl);
    } else {
        // amend this for multiples 
        console.log("intersection observer not available")
        let delay = isMultiple ? 8000 : 2000

        console.log(delay)

        setTimeout(animateBars(estCols, yScale, h, estSpan, estPercentInfected), delay);

    }

}








export {makeColChart}