const SearchData = require("./searchModel");

const addData = async (data) => {
  const searchData = new SearchData(data);
  await searchData.save();
  return searchData;
};

module.exports = addData;
