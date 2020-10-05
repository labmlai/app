export interface UserModel {
    sub: string
    email: string
    name: string
    email_verified: boolean
    picture: string
    labml_token: string
    is_sharable: boolean
}

export class User {
    sub: string
    email: string
    name: string
    email_verified: boolean
    picture: string
    labml_token: string
    is_sharable: boolean


    constructor(user: UserModel) {
        this.sub = user.sub
        this.email = user.email
        this.name = user.name
        this.email_verified = user.email_verified
        this.picture = user.picture
        this.labml_token = user.labml_token
        this.is_sharable = user.is_sharable
    }
}