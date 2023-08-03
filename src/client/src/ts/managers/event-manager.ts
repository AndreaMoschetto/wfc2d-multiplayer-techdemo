export class EventManager {
private static instance: EventManager
    private eventListeners: Record<string, Function[]> = {}

    private constructor() { }

    public static getInstance(){
        if(!this.instance)
            this.instance = new EventManager()
        return this.instance
    }

    public on(event: string, listener: Function) {
        if (!this.eventListeners[event])
            this.eventListeners[event] = []

        this.eventListeners[event]?.push(listener)
    }

    public off(event: string, listener: Function) {
        if (this.eventListeners[event]) {
            const index: number = this.eventListeners[event]?.indexOf(listener) ?? -1
            if (index !== -1)
                this.eventListeners[event]?.splice(index, 1)
        }
    }

    public emit(event: string, ...args: any[]) {
        const listeners = this.eventListeners[event]
        if (listeners)
            listeners.forEach((listener) => listener(...args))
    }
}