const { randomUUID } = require('crypto')
const { Buffer } = require('buffer')

const uWS = require('./uWebSockets.js-20.5.0')
const port = process.env.port | 8800;
const unregistredConnections = [];
const clientsList = []

const enums = Object.freeze({
    enum_newConnection: 'enum_newConnection',
    enum_newClient: 'enum_newClient',
    enum_newMessage: 'enum_newMessage',
    enum_selfConnection: 'enum_selfConnection',
    enum_selfRegistred: 'enum_selfRegistered',
    enum_connectionClosed: 'enum_connectionClosed'
})

function makeJson(thing){
    return JSON.stringify(thing)
}

const app = uWS.App()

app.ws('/ws', {
    compression: 0,
    maxPayloadLength: 16 * 1024 * 1024,
    idleTimeout: 60,

    open: ws => {
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
        app.publish(enums.enum_newConnection, makeJson(newConnection_noticement))
        console.log(`\n\nnew unauthorized connection: ${ws.id}\n\n`)
    },

    message: (ws, text) => {
        const message = Buffer.from(text).toString()
        if (ws.name != undefined) {
            const NewMessage_noticement = {
                type: enums.enum_newMessage,
                body: {
                    id: ws.id,
                    name: ws.name,
                    text: message
                }
            }
            app.publish(enums.enum_newMessage, makeJson(NewMessage_noticement))

            console.log(`\n\nnew message from ${ws.id} or ${ws.name}: \n${message}\n\n`)
        }

        else {
            ws.name = message

            const client = {
                id: ws.id,
                name: ws.name
            }
            const newClient_noticement = {
                type: enums.enum_newClient,
                body: client
            }
            const selfRegistred_noticement = {
                type: enums.enum_selfRegistred,
                body: client
            }

            clientsList.push(client)
            app.publish(enums.enum_newClient, makeJson(newClient_noticement))

            ws.subscribe(enums.enum_newMessage)
            ws.subscribe(enums.enum_newClient)
            ws.subscribe(enums.enum_newConnection)
            ws.subscribe(enums.enum_connectionClosed)

            ws.send(makeJson(selfRegistred_noticement))
            console.log(`\n\nnew client\nid:${ws.id}\nname:${ws.name}\n\n`)
        }
    },

    close: ws => {
        const socketName = ws.name

        const connectionClosed_noticement = {
            type: enums.enum_connectionClosed,
            body: {
                id: ws.id,
                name: socketName
            }
        }
        
        app.publish(enums.enum_connectionClosed, makeJson(connectionClosed_noticement))
        console.log(`\n\nconnection closed: ${ws.id}\n\n`)
    }

})

app.listen(port, fine => {
    fine ?
    console.log(`\n\nlistening to the port ${port}\n\n`) :
    console.log(`\n\nlistening error with port ${port}\n\n`)
})















