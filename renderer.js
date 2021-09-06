const ipc = require('electron').ipcRenderer
window.addEventListener('DOMContentLoaded', () => {
  const folder = document.getElementById('folder')
  const btn = document.getElementById('start')
  const msg = document.getElementById('res')
  const close = document.getElementById('close')
  close.style = 'display:none;'
  btn.style = 'display:none;'

  folder.addEventListener('click', () => {
    ipc.send('choose-folder')
  })

  // ipc.send('init')
  ipc.on('init', function (event, btnText) {
    btn.innerText = btnText
    folder.style = 'display:none;'
    btn.style = 'display:block';
  })

  btn.addEventListener('click', () => {
    ipc.send('start')
    btn.style.display = 'none'
  })
  ipc.on('message', (event, res) => {
    const p = document.createElement('p')
    if(res.error) p.style ="color:red;"
    p.innerText = res.text
    msg.appendChild(p)
  })
  ipc.on('close', (event, message) => {
    
    close.addEventListener('click', () => {
      ipc.send('close')
    })
    close.style = 'display:block;'
  })
})


