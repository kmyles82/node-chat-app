const generateMessage = (text) => {
    return {
        text,
        createAt: new Date().getTime()
    }
}

const generateLocationMessage = (url) => {
    return {
        text: url,
        createAt: new Date().getTime()
     }
 }

module.exports = { generateMessage, generateLocationMessage }