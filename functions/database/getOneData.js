const searchData = require("./searchModel");

// Get one data by title
const getOneData = async (title) => {
    return await searchData.findOne({title});
}

module.exports = getOneData;