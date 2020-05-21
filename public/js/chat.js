const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $locationMessage = document.querySelector('#locationMessage')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

//server (emit) -> client (receive) --acknowledgement--> server
//client (emit) -> server (receive) --acknowledgement--> client

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        msg: msg.text,
        createAt: moment(msg.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, {
        url,
        createAt: moment(url.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML("beforeend", html)
})



$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disable the form
    $messageFormButton.setAttribute('disabled', 'disabled')

    const msg = e.target.elements.msg.value
    // console.log(msg)

    socket.emit('sendMessage', msg, (error) => {
        //enable the form
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
    
})

$sendLocationButton.addEventListener('click', (e) => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords.latitude)
        console.log(position.coords.longitude)

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
                
                if (error) {
                    return console.log(error)
                }
                $sendLocationButton.removeAttribute('disabled')
                console.log('Location shared!')
        })
    })

    
})

