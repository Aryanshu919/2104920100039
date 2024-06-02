const express = require("express");

const app = express();

PORT = 9876;

app.listen(PORT, () =>{
    console.log("app is running");
});

app.get("/" , (req,res) =>{
    res.send(`<h1> this is homepage</h1>`);
})