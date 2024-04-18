const SearchData = require('./searchModel');

const searchData = async (query) => {
  const start = performance.now();  
  
  try {
    const pipeline = [
      {
        $search: {
          index: 'default', 
          text: {
            query: query,
            path: {
              'wildcard': '*'
            }
          }
        }
      },
      {
        $limit: 10 
      }
    ];

    const results = await SearchData.aggregate(pipeline);
    
    const end = performance.now(); 
    console.log(`Search completed in ${end - start} milliseconds.`);  
    
    return results;
  } catch (error) {
    const end = performance.now(); 
    console.error(`Error during search operation: ${error}. Took ${end - start} milliseconds.`);
    throw new Error("Failed to complete search due to an internal server error.");
  }
};

module.exports = searchData;


module.exports = searchData;
