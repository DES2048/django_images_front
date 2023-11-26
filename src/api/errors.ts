export type StrDictionary = {
    [index: string]: string
}

export class ApiError extends Error {

}
export class NetworkError extends ApiError {

}
export class ServerError extends ApiError{
    statusCode: number;
    constructor(statusCode:number, message:string="") {
        super()
        this.statusCode = statusCode;
        this.message = message;
    }
}

export class ClientError extends ApiError {
    statusCode: number;
    constructor(statusCode:number, message:string="") {
        super()
        this.statusCode = statusCode;
        this.message = message;
    }
}
export class ValidationError extends ClientError{
    fieldErrors: StrDictionary = {}
    commonErrors: StrDictionary = {}
    constructor(commonErrors:StrDictionary, fieldErrors:StrDictionary) {
        super(400)
        this.commonErrors = commonErrors
        this.fieldErrors = fieldErrors
    }
}
export class NotFoundError extends ClientError {
    constructor(message:string) {
        super(404, message)
    }
}