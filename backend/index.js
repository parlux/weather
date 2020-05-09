// TODO: Fix bug with lots of cancelled requests, might be because it's requesting so quickly, rerequests cancel the initial request? 

const restify = require('restify');
const Client = require('ftp');
const corsMiddleware = require('restify-cors-middleware')
const fs = require('fs');

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
})

// Create server
const server = restify.createServer();

// Server config
server.pre(cors.preflight)
server.use(cors.actual)

// Server routes
server.get(`${process.env.SITE_ROOT}list`, (req, res, next) => {
  const c = new Client();

  c.on('ready', function() {
    console.log('Fetching list...')
    c.list('anon/gen/radar/', function(err, list) {
      if (err) throw err;

      // const radar128Melb = list.filter(item => item.name.includes('IDR023'))
      const radar128Melb = list
        .reduce((agg, item) => {
          if (item.name.includes('IDR023') && item.name.includes('png')) {
            const dateString = item.name.match(/\d{12}/)[0]
            agg.push({
              url: `/image/${item.name}`,
              date: `${dateString.substr(0, 4)}-${dateString.substr(4, 2)}-${dateString.substr(6, 2)} ${dateString.substr(8, 2)}:${dateString.substr(10, 2)}Z`
            })
          }
          return agg
        }, [])
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      res.json(radar128Melb)
      next()
    });
  });

  c.connect({
    host: 'ftp2.bom.gov.au',
    port: 21
  });
})

server.get(`${process.env.SITE_ROOT}image/:imageName`, (req, res, next) => {
  console.log("Checking cache")
  fs.access(`./cached-images/${req.params.imageName}`, fs.constants.F_OK, (err) => {
    if (err) {
      // File doesn't exist, so fetch
      console.log("Fetching image")
      var c = new Client();
      c.on('ready', function() {
        c.get(`anon/gen/radar/${req.params.imageName}`, (err, stream) => {
          if (err) throw err

          // Write to FS
          console.log(`Writing to ./cached-images/${req.params.imageName}`)
          const writable = fs.createWriteStream(`./cached-images/${req.params.imageName}`);
          stream.pipe(writable)
          
          const readFileStream = fs.createReadStream(`./cached-images/${req.params.imageName}`)
          readFileStream.pipe(res)
          next()
        })
      });
      c.connect({
        host: 'ftp2.bom.gov.au',
        port: 21
      });
    } else {
      console.log("Serving from cache")
      const readFileStream = fs.createReadStream(`./cached-images/${req.params.imageName}`)
      readFileStream.pipe(res)
    }
  });
});

// Server listen
server.listen(process.env.PORT || 8081, function() {
  console.log('%s listening at %s', server.name, server.url);
});
