class AppState {
    private loggedIn: boolean
    private callback: null | ((state: boolean) => void)

    constructor() {
        this.loggedIn = false
        this.callback = null
    }

    isLoggedIn(): boolean {
        return this.loggedIn
    }

    setLoggedIn(state: boolean) {
        this.loggedIn = state
        if (this.callback != null) {
            this.callback(state)
        }
    }

    onLoginChanged(callback: (state: boolean) => void) {
        this.callback = callback
    }
}

const APP_STATE = new AppState()

export {APP_STATE}