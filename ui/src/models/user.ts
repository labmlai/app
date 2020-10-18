export interface UserModel {
    sub: string
    email: string
    name: string
    picture: string
    email_verified: boolean
    projects: object
    default_project: object
}

export class User {
    sub: string
    email: string
    name: string
    picture: string
    email_verified: boolean
    projects: object
    default_project: object


    constructor(user: UserModel) {
        this.sub = user.sub
        this.email = user.email
        this.name = user.name
        this.picture = user.picture
        this.email_verified = user.email_verified
        this.projects = user.projects
        this.default_project = user.default_project
    }
}