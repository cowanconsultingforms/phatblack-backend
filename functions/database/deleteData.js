const searchData = require('./searchModel');

// Delete by title
const deleteData = async (title) => {
    try 
    {
        return await searchData.findOneAndDelete({ title });
    } 
    catch (error) 
    {
        throw error;
    }
}

module.exports = deleteData;
