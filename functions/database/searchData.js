const SearchData = require("./searchModel");

const searchData = async (query) => {
  const pipeline = [
    {
      $search: {
        index: "default",
        text: {
          query: query,
          path: {
            "wildcard": "*",
          },
        },
      },
    },
    {
      $limit: 10,
    },
  ];

  const results = await SearchData.aggregate(pipeline);

  return results;
};

module.exports = searchData;
