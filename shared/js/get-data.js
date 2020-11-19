
// LA urls
const gbUrl = "https://gdn-cdn.s3.amazonaws.com/2020/coronavirus-uk-local-data/v5/gb-utlas.json";

const nationsUrl = "https://gdn-cdn.s3.amazonaws.com/2020/coronavirus-uk-local-data/v5/gb-nations.json"



const ultaData = "https://interactive.guim.co.uk/docsdata-test/1jRtPuGUxZxb-RvWIGIqdQspgqWWKpZrsQgrsNxvGKb4.json"


// get local authority level data for different regions 
const getGbLas = async () => {
    const res = await fetch(gbUrl)
    return res.json()
};

// get nations level data 
const getNations = async () => {
    const res = await fetch(nationsUrl)
    return res.json()
};

// get weekly change data
const getUtlaCases = async () => {
    const res = await fetch(ultaData)
    return res.json()
};


export {getNations, getUtlaCases};