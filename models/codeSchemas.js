const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const codeSchema = new Schema({
    email: {
              type: String,
              required: true,
           },
    code: {
              type: String,
              required: true,
          }  
});





const Code =  mongoose.model("Code", codeSchema);

module.exports = Code