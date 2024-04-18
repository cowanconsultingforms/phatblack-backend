const SearchData = require('./searchModel');

const addData = async (data) => {
  try {
    const searchData = new SearchData(data);
    await searchData.save();
    return searchData;
  } catch (error) {
    throw error;
  }
};

module.exports = addData;