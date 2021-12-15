const { randomUUID } = require('crypto')

const uWS = require('/home/ilua/Templates/uws/uWebSockets.js-20.5.0')
const port = process.env.port | 7777;
let unregistredConnections = [];
let clientsList = []
const enums = Object.freeze({
    enum_newConnection: 'enum_newConnection',
    enum_newClient: 'enum_newClient',
    enum_newMessage: 'enum_newMessage',
    enum_selfConnection: 'enum_selfConnection',
    enum_selfRegistred: 'enum_selfRegistered',
    enum_connectionClosed: 'enum_connectionClosed'
})
const app = uWS.SSLApp()

app.ws('/*', {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,

    open: (ws,req) => {
        ws.id = randomUUID()
        unregistredConnections.push(ws.id)
        
        const newConnection_response = {
            type: enums.enum_selfConnection,
            body: {
                id: ws.id,
                message: {
                    en: "throw your name, please",
                    ru: "отправьте имя на сервер"
                }
            }
        }

        const newConnection_noticement = {
            type: enums.enum_newConnection,
            body: {
                id: ws.id
            }
        }

        ws.send(JSON.stringify(newConnection_response))
        app.publish(enums.enum_newConnection, newConnection_noticement)
        console.log(`new un authorized connection: ${ws.id}`)
    },

    message: (ws, message) => {
        if (ws.name){
            const NewMessage_noticement = {
                type: enums.enum_newMessage,
                body: {

                }
            }
        }
    },

    close: (ws, code, message) => {
        const socketName = ws.name

        const connectionClosed_noticement = {
            type: enums.enum_connectionClosed,
            body: {
                id: ws.id,
                name: socketName
            }
        }
        
        app.publish()
    }

})

app.listen(port, fine => {
    fine ?
    console.log(`listen ${port}`) :
    console.log(`failed ${port}`)
})















