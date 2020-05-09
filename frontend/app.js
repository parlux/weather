// TODO: fix hardcoded API url
// TODO: fix nginx routes for css/js files  
(async () => {
  const get = (url) => {
    const listener = (event, resolve) => resolve(event.target.responseText)

    return new Promise(resolve => {
      var request = new XMLHttpRequest()
      request.addEventListener("load", (event) => listener(event, resolve))
      request.open("GET", url)
      request.send()
    })
  }

  const NUMBER_OF_LOOP_IMAGES = 5
  const LOOP_SPEED = 300
  const CHECK_FOR_UPDATES = 5
  const API_URL = 'http://paulc.in/weather-api'
  let radarLoop
  let newList
  let list

  const runRadarLoop = () => {
    let counter = 0
    radarLoop = setInterval(() => {
      if (counter < (NUMBER_OF_LOOP_IMAGES) && newList.length) {
        document.querySelector('#radar').src = `${API_URL}${newList[counter].url}`
        document.querySelector('.time').innerHTML = moment(newList[counter].date).format("dddd h:mma")
        
        counter += 1
      } else {
        counter = 0
      }
    }, LOOP_SPEED)
  }

  const loadList = async () => {
    list = await get(`${API_URL}/list`)
    list = JSON.parse(list)
    newList = list.slice(list.length - NUMBER_OF_LOOP_IMAGES) // take last N items
    radarLoop && clearInterval(radarLoop)
    runRadarLoop()
  }

  // Run
  await loadList()
  setInterval(() => {
    console.log('checking for updates');
    loadList()
  }, 1000 * 60 * CHECK_FOR_UPDATES)
})()
