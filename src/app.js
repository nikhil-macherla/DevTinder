const express = require('express');

const app = express(); // instance of express app

app.use((req, res) =>
{
  res.send("hello from the server!");
})

app.listen(3000, () =>
{
  console.log("server is listening on port 3000");
});
