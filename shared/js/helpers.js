import axios from "axios";
import * as d3 from "d3";
import moment from "moment";

const getData = async (url) => {
    return await axios.get(url); 
}

const getAllDataLastXDays = (allData, date, x) => {
    const dateMinusX = moment(date, "YYYY-MM-DD").subtract(x, "days");
    const datePlusOne = moment(date, "YYYY-MM-DD").add(1, "days");

    const datesInRange = allData.filter( d => {
        const dataDate = moment(d.date, "YYYY-MM-DD");
        return dataDate.isBefore(datePlusOne) && dataDate.isAfter(dateMinusX);
    })
    return datesInRange;
}

const getData7DaysAgo = (data, startDate) => data.find(d => {
    const datePlusOne = new Date(d3.timeDay.offset(startDate, +1));
    const dateMinusOne = new Date(d3.timeDay.offset(startDate, -1));
    const result = new Date(d.date) < datePlusOne && new Date(d.date) > dateMinusOne;
    return result;
})

const getCasesLastWeek = (data, latestDate) => {
    const date7DaysAgo =  new Date(d3.timeDay.offset(latestDate, -7)); // date 7 days ago  
    const data7DaysAgo = getData7DaysAgo(data, date7DaysAgo);
    return data7DaysAgo.newCases;
}

const cleanUpNum = (obj) => {
    return Object.keys(obj).reduce((acc, curr) => {
        acc[curr] = ( obj[curr] ? obj[curr].toLocaleString("en-gb") : "0");
        return acc;
    }, {}) 
}
  

export {getData, getCasesLastWeek, cleanUpNum, getAllDataLastXDays};