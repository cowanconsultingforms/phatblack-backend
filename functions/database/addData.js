const SearchData = require("./searchModel");

const addData = async (data) => {
  // Create a new document with the data
  const searchData = new SearchData(data);
  // Save the document
  await searchData.save();
  return searchData;
};

module.exports = addData;
