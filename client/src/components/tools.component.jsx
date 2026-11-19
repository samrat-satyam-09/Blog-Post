import Embed from '@editorjs/embed';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Header from '@editorjs/header';
import Quote from '@editorjs/quote';
import Marker from '@editorjs/marker';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import { uploadImage } from '../common/aws';


// upload image by file code here
const uploadImageByFile = (e) => {
   return uploadImage(e).then(url => {
      if (url) {
         return {
            success: 1,
            file: { url }
         }
      }
   })
      .catch(err => {
         console.error(err);
         return {
            success: 0,
            error: 'Failed to upload image.'
         }
      });
};


// upload image by URL code here
const uploadImageByURL = (e) => {
   let link = new Promise((resolve, reject) => {
      try {
         resolve(e)
      } catch (error) {
         reject(error);
      }
   })
   return link.then(url => {
      return {
         success: 1,
         file: { url }
      }
   });
}


export const tools = {
   embed: Embed,
   list: {
      class: List,
      inlineToolbar: true
   },

   image: {
      class: Image,
      config: {
         placeholder: 'Choose image or Paste image URL...',
         uploader: {
            uploadByUrl: uploadImageByURL,
            uploadByFile: uploadImageByFile
         }
      }
   },

   header: {
      class: Header,
      inlineToolbar: true,
      config: {
         placeholder: 'Type Heading...',
         levels: [2, 3, 4],
         defaultLevel: 2,
         maxLevels: 4,

      }
   },

   quote: {
      class: Quote,
      inlineToolbar: true
   },

   code: {
      class: Code,
      inlineToolbar: true,
      config: {
         placeholder: 'Type or paste your code...',
         language: 'javascript'

      }
   },

   marker: Marker,
   inlineCode: InlineCode,  // We can Add custom tools here if needed.

}
