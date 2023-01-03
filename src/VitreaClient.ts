import {Mutex}                  from 'async-mutex'
import {Login}                  from './requests/Login'
import {BaseRequest}            from './requests/BaseRequest'
import {BaseResponse}           from './responses/BaseResponse'
import {AbstractSocket}         from './socket/AbstractSocket'
import {ResponseFactory}        from './responses/ResponseFactory'
import {TimeoutException}       from './TimeoutException'
import {ToggleHeartBeat}        from './requests/ToggleHeartBeat'
import {SplitMultipleBuffers}   from './utilities/SplitMultipleBuffers'
import {VitreaHeartbeatHandler} from './VitreaHeartbeatHandler'
import Net                      from 'net'

export class VitreaClient extends AbstractSocket {
    protected readonly mutex = new Mutex()
    protected readonly username : string
    protected readonly password : string

    public constructor(host : string, port : number, username : string, password : string) {
        super(host, port)
        this.username  = username
        this.password  = password
        this.heartbeat = new VitreaHeartbeatHandler(this)
        this.heartbeat.restart()
    }

    public async send<T extends BaseRequest, R extends BaseResponse>(request : T) : Promise<R> {
        // const eventName = {eventName: request.eventName}

        // this.log.debug('Waiting for mutex', eventName)
        const release = await this.mutex.acquire()
        // this.log.debug('Acquired mutex', eventName)

        return new Promise(async (res, rej) => {
            // this.log.info('Sending data', request.logData)

            let callback : (data : R) => void

            const timeout = setTimeout(() => {
                const message = 'Sending timeout reached'

                // this.log.error(message, eventName)

                this.removeListener(request.eventName, callback)

                rej(new TimeoutException(message))

                release()
            }, 1000)

            callback = data => {
                clearTimeout(timeout)
                setTimeout(() => {
                    release()
                    res(data)
                }, 250)
            }

            this.once(request.eventName, callback)

            this.write(request.build())
        })
    }

    protected async onConnect(socket : Net.Socket) {
        await super.onConnect(socket)

        await this.send(new ToggleHeartBeat())

        await this.send(new Login(this.username, this.password))
    }

    protected onData(data : Buffer) : void {
        const split = SplitMultipleBuffers.handle(data)

        if (split.length > 1) {
            return split.forEach(buffer => this.onData(buffer))
        }

        data = split[0]

        const response = ResponseFactory.find(data)

        if (response) {
            // this.log.info('Data Received', response.logData)

            this.emit(response.eventName, response)
        } else {
            // this.log.warn('Ignoring unrecognized received data', {raw: data.toString('hex')})
        }
    }
}
