const SearchData = require("./searchModel");

const searchSuggestions = async (query) => {
    if(query === "all")
    {
        const results = await SearchData.find().limit(10);
        return results;
    }
    else
    {
        const results = await SearchData.find({ firestoreCollection: query }).limit(10);
        return results;
    }
};

module.exports = searchSuggestions;