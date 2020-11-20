

// const gbUrl = "https://gdn-cdn.s3.amazonaws.com/2020/coronavirus-uk-local-data/v5/gb-utlas.json";

const nationsUrl = "https://gdn-cdn.s3.amazonaws.com/2020/coronavirus-uk-local-data/v5/gb-nations.json"

// estimated and actual data at a national level
const engData = ""

const ultaData = "https://interactive.guim.co.uk/docsdata-test/1jRtPuGUxZxb-RvWIGIqdQspgqWWKpZrsQgrsNxvGKb4.json"


// get nations level data 
const getNations = async () => {
    const res = await fetch(nationsUrl)
    return res.json()
};

// get estimated and actual cases by utla 
const getUtlas = async () => {
    console.log("called")
    const res = await fetch(ultaData)
    console.log("Res", res);
    return res.json()
};


export {getNations, getUtlas};