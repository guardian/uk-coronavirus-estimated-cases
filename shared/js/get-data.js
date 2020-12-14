// const gbUrl = "https://gdn-cdn.s3.amazonaws.com/2020/coronavirus-uk-local-data/v5/gb-utlas.json";

// estimated and actual data at a national level
const ultaData = "https://interactive.guim.co.uk/docsdata-test/1jRtPuGUxZxb-RvWIGIqdQspgqWWKpZrsQgrsNxvGKb4.json"

// get estimated and actual cases by utla 
const getUtlas = async () => {
    const res = await fetch(ultaData)
    return res.json()
};


export {getUtlas};