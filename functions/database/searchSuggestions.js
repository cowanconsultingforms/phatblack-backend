const SearchData = require("./searchModel");

const searchSuggestions = async (query) => {
  if (query === "all") { // if query is "all", return 10 results
    const results = await SearchData.find().limit(10);
    return results;
  } else { // otherwise, return 10 results that match the query
    const results = await SearchData.find({firestoreCollection: query}).limit(10);
    return results;
  }
};

// the .find() method allows us to search for documents in the collection
// we can use no arguments to return all documents or pass in a query object
// the .limit() method allows us to limit the number of results returned
module.exports = searchSuggestions;
