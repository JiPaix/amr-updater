const ipc = require('electron').ipcRenderer
window.addEventListener('DOMContentLoaded', () => {
  const folder = document.getElementById('folder')
  const start = document.getElementById('start')
  const res = document.getElementById('res')
  const logo = document.getElementById('logo')
  const msg = document.getElementById('msg')
  const fixedlogo = document.getElementById('fixedlogo')
  fixedlogo.style.display = 'none'
  start.style.display = 'none'
  res.style.display = 'none'
  logo.style.display = "none"

  folder.addEventListener('click', () => {
    ipc.send('choose-folder')
  })

  // ipc.send('init')
  ipc.on('init', function (event, btnText) {
    console.log('init')
    start.innerText = btnText
    folder.style.display = 'none'
    start.style.display = 'flex';
    res.style.display = 'flex';
  })

  start.addEventListener('click', () => {
    ipc.send('start')
    start.style.display = 'none'
  })

  ipc.on('message', (event, res) => {
    if(res.error) {
      msg.style.color = "red"
      logo.style.display = "none"
      fixedlogo.style.display = 'flex'
    } else {
      logo.style.display = "flex"
    }
    msg.innerText = res.text
  })

  ipc.on('close', (event, iserror) => {
    res.style.display = 'flex'
    folder.style.display = 'none'
    logo.style.display = 'none'
    if(!iserror) {
      fixedlogo.style.display = 'flex'
    }
  })
})


