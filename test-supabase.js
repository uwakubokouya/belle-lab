const url = "https://qyynkpoxgtmjbxpyclxx.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5eW5rcG94Z3RtamJ4cHljbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NTc1NjQsImV4cCI6MjA4NjAzMzU2NH0.Xel-jwlytQDq8mOTaPZrvyrk4JJw01dWDJDWotEJKqs";
const fs = require('fs');

fetch(url)
.then(res => res.json())
.then(data => {
    fs.writeFileSync('schema.json', JSON.stringify(data, null, 2));
    console.log("Schema saved to schema.json");
})
.catch(err => console.error("Error:", err));
