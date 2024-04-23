const SearchData = require("./searchModel");

const updateData = async (title, newDescription) => {
  return await SearchData.findOneAndUpdate(
      {title}, // find the document with the title
      {$set: {description: newDescription}}, // update only the description field
      {new: true}, // return the updated document
  );
};

module.exports = updateData;
