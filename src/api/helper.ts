import Cookie from 'js-cookie'
import { ClientError, NetworkError, ServerError, ValidationError } from './errors';

const CSRF_COOKIE_NAME = 'csrftoken'
const CSRF_HEADER_NAME = 'X-CSRFToken'

export default class HttpHelper {
    private static getCSRFfromCookie() {
        return Cookie.get(CSRF_COOKIE_NAME)!;
    }
    private static setCSRFToken() {
        return {
            [CSRF_HEADER_NAME]: HttpHelper.getCSRFfromCookie()
        }
    }
    public static async doMethod<R>(method: string, url: URL, body?: any): Promise<R> {
        let resp: Response;
        try {
            resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.setCSRFToken()
                },
                body: body ? JSON.stringify(body) : undefined
            });

        } catch (err) {
            throw new NetworkError((err as Error).message)
        }

        const statusCode = resp.status

        if (statusCode >= 400 && statusCode <= 499) {
            if (statusCode === 400) {
                // create validation error
                const errors = await resp.json() as { [index: string]: string[] }
                const { "common-errors": commonErrors, ...fieldErrors } = errors;
                throw new ValidationError(fieldErrors, commonErrors)
            }
            throw new ClientError(statusCode, "client error")
        } else if (statusCode >= 500 && statusCode <= 599) {
            throw new ServerError(statusCode, "server error")
        }
        if (+resp.headers.get("Content-Length")! > 0)
            return await resp.json() as R
        else
            return Promise.resolve() as R
    }
    public static async doPost<R>(url: URL, body?: any): Promise<R> {
        return await this.doMethod<R>("POST", url, body)
    }
}