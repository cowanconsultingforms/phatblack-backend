const searchData = require("./searchModel");

// Delete by title
const deleteData = async (title) => {
  return await searchData.findOneAndDelete({title});
};

module.exports = deleteData;
