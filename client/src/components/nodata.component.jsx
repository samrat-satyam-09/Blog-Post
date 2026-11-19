import VeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NoDataMessage = ({ message }) => {

   return (
      <div className="flex items-center justify-center text-center text-text font-sans w-full p-4 rounded-full mt-4">
         <p className='flex gap-2'><VeryDissatisfiedIcon/>{message}</p>
      </div>
   )

}

export default NoDataMessage;