import type { Ref } from "vue"

export type BaseFieldErrors<T> = {
    [index: string]: T
}

type ErrorDetail = string[]
export type FieldErrors = BaseFieldErrors<ErrorDetail>

export type ToFieldErrors<T> = {
   [key in keyof T]: ErrorDetail 
}  

export class ApiError extends Error {
    statusCode:number
    constructor(statusCode:number, message?:string) {
        super(message || "api error")
        this.statusCode = statusCode
    }
}
export class NetworkError extends Error {

}
export class ServerError extends ApiError{
    constructor(statusCode:number, message?:string) {
        super(statusCode, message)
    }
}

export class ClientError extends ApiError {
    constructor(statusCode:number, message?:string) {
        super(statusCode, message)
    }
}
export class ValidationError<FE=FieldErrors, CE=ErrorDetail> extends ClientError{
    fieldErrors?: FE
    commonErrors?: CE
    constructor(fieldErrors?:FE, commonErrors?:CE) {
        super(400)
        this.commonErrors = commonErrors
        this.fieldErrors = fieldErrors
    }
}
export class NotFoundError extends ClientError {
    constructor(message?:string) {
        super(404, message)
    }
}

export function validationErrorHandler(err:ValidationError, fieldErrors:FieldErrors, 
    commonErrors?: Ref<ErrorDetail>) {
        if (commonErrors && err.commonErrors) {
            commonErrors.value = err.commonErrors
        }
        for (let field of Object.keys(err.fieldErrors || {})) {
            fieldErrors[field] = err.fieldErrors![field]
        }
    }

    export function resetFieldErrors(errors:FieldErrors) {
        for(let key in Object.keys(errors)) {
            errors[key] = []
        }
    }