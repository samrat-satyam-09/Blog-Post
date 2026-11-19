import Loader from "./loader.component";

const LoadMoreData = ({ state, fetchDataFun, additionalParam }) => {

   if (state != null && state.totalDocs > state.results.length) {

      return (
         <button
            onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1 })}
            className="flex items-center justify-center gap-2 bg-border hover:bg-grey/10 duration-200 text-text px-6 p-2 rounded-md">
            Load More
         </button>
      )
   }
}

export default LoadMoreData;