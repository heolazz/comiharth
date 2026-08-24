const fs = require('fs');
fetch('https://07.ikiru.wtf/?s=The+Heavenly+Demon', {
  headers: {
    'User-Agent': 'Mozilla/5.0'
  }
})
.then(r => r.text())
.then(html => {
  const resultLinks = html.match(/<a[^>]*href=['"](https:\/\/07\.ikiru\.wtf\/manga\/[^'"]+)['"][^>]*>/gi);
  if (resultLinks) {
    console.log("Found search results:", new Set(resultLinks).size);
    console.log([...new Set(resultLinks)]);
  } else {
    console.log("No search results found");
  }
})
.catch(console.error);
