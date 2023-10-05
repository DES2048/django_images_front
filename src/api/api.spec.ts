// @vitest-environment jsdom
import {expect, describe, test, vi, afterEach} from 'vitest'
import api, { fakeDeleteMode} from './index'

Object.defineProperty(window, 'location', {
    value: {
        search: "",
    },
    writable: true
})

describe("api tests", ()=>{
    
    afterEach(()=>{
        vi.restoreAllMocks()
    })

    test("test fake del mode", ()=>{
        expect(fakeDeleteMode()).toBeFalsy();
    
       
        window.location.search = "?fake-del"
        expect(window.location.search).toBe("?fake-del");
        expect(fakeDeleteMode()).toBeTruthy();
    
    })
    test("doPost", async ()=>{
        // test post without body
        const fetchMock = vi.fn()
        global.fetch = fetchMock
        fetchMock.mockReturnValue({
            headers: {
                get(name:string) {
                    return 56
                }  
            },
            async json() {
                return {data: "data"}
            }
        })
        const url = new URL("http://example.com/post")
        vi.mock('js-cookie', ()=>{
            return {
                default: {
                    get(cname:string) {
                        return "csrf-token"
                    }
                }
            }
        })
        await api.doPost(url)
        expect(fetchMock).toHaveBeenCalledWith(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken' : 'csrf-token'
            },
        })

        // test post with body
        const body = {data: 'data', value: 1}
        await api.doPost(url, body)
        expect(fetchMock).toHaveBeenCalledWith(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken' : 'csrf-token'
            },
            body: JSON.stringify(body)
        })

        // test no content
        const jsonMock = vi.fn()
        fetchMock.mockReturnValue({
            headers: {
                get(name:string) {
                    return 0 // content length
                }  
            },
            json: jsonMock
        })
        await api.doPost<void>(url)
        expect(jsonMock).toBeCalledTimes(0)

    })
    test("delete image", async ()=> {
        const doPostMock = vi.fn()
        api.doPost = doPostMock;
        window.location.search = "";
        await api.deleteImage("gallery", "image.jpg");
        expect(doPostMock).toHaveBeenCalledOnce()
        window.location.search = "?fake-del";
        await api.deleteImage("gallery", "image.jpg");
        expect(doPostMock).toHaveBeenCalledOnce()
        doPostMock.mockRestore()
    })
})

