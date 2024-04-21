const SearchData = require("./searchModel");

const addData = async (data) => {
  // Create a new document with the data, like creating a new instance of a class
  const searchData = new SearchData(data);
  // Save the document
  await searchData.save();
  return searchData;
};

module.exports = addData;
