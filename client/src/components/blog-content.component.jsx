const Img = ({ url, caption }) => {
   return (
      <div className={`${caption ? "md:px-4 md:pt-5 rounded-md bg-border" : "md:px-4 md:py-3 rounded-md bg-border"}`}>
         <img src={url} />
         {caption.length ? <p className="w-full text-center my-3 md:mb-10 text-base md:text-xl text-grey capitalize">{caption}</p> : ""}
      </div>
   )
}

const Quote = ({ quote, caption }) => {
   return (
      <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple/80 rounded-r-sm">
         <p className="text-xl leading-10 md:text-2xl" dangerouslySetInnerHTML={{ __html: quote }}></p>
         {caption.length ? <p className="w-full text-center text-base md:text-xl text-red capitalize mt-3">{caption}</p> : ""}
      </div>
   )
};

const List = ({ style, items }) => {
   return (
      <ol className={`pl-5 ${style == "ordered" ? "list-decimal" : "list-disc"}`}>
         {
            items.map((listItems, index) => {
               return (
                  <li key={index}
                     className="my-4"
                     dangerouslySetInnerHTML={{ __html: listItems }}></li>
               )
            })
         }
      </ol>
   )
};




const BlogContent = ({ block }) => {

   let { type, data } = block;

   if (type == "paragraph") {
      return (
         <p className="text-text" dangerouslySetInnerHTML={{ __html: data.text }}></p>
      )
   }
   if (type == "header") {
      if (data.level == 3) {
         return (
            <h3 className="text-light font-bold text-3xl" dangerouslySetInnerHTML={{ __html: data.text }}></h3>
         )
      }
      return (
         <h2 className="text-light font-bold text-4xl" dangerouslySetInnerHTML={{ __html: data.text }}></h2>
      )
   }
   if (type == "image") {
      return (
         <Img url={data.file.url} caption={data.caption} />
      )

   }
   if (type == "quote") {
      return (
         <Quote quote={data.text} caption={data.caption} />
      )
   }
   if (type == "list") {
      return (
         <List style={data.style} items={data.items} />
      )
   }
   if (type == "code") {
      return (
         <pre className="bg-border p-3 px-5 md:px-10 rounded-md overflow-x-scroll font-medium text-white/80 font-sans">
            <code className="language-javascript">

               {data.code}

            </code>

         </pre>
      )
   }

   else {
      return <h1>This is a Blocks</h1>
   }

}

export default BlogContent;