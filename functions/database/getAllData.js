const searchData = require("./searchModel");

const getAllData = async () => {
  return await searchData.find();
};

module.exports = getAllData;
