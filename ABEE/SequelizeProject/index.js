const express=require("express");
const app=express();
const database=require("./database");

database();
app.listen(8080,()=>{
    console.log("App is working at: http://localhost:"+8080);
})