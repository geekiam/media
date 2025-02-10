import {Hono} from 'hono'
import {Resource} from "sst";
import {R2ObjectBody} from "@cloudflare/workers-types";


const app = new Hono()
app.post("/*", async (c) => {

    let filename = `${crypto.randomUUID()}.${getMimeTypeFromArrayBuffer(await c.req.arrayBuffer())}`;

    await Resource.Bucket.put(filename, await c.req.arrayBuffer(), {
        httpMetadata: {
            contentType: c.req.header("content-type"),
        },
    });

    const apiUrl = new URL(c.req.url)
    apiUrl.pathname = `/${filename}`
    c.header("location", apiUrl.toString());
    return c.json({
       filename: `${filename}`
    }, 201);


});


app.get("/:filename", async (c) => {
    const filename = c.req.param('filename');

    const result = await Resource.Bucket.get(filename) as R2ObjectBody | null;

    if (result === null || result.body === null) {
        return c.notFound();
    }


    c.header("content-type", getContentType(filename));

    // @ts-ignore
    const arrayBuffer = await new Response(result.body).arrayBuffer();
    return c.body(arrayBuffer, 200);


})


function getMimeTypeFromArrayBuffer(arrayBuffer: ArrayBuffer) {
    const uint8arr = new Uint8Array(arrayBuffer)

    const len = 4
    if (uint8arr.length >= len) {
        let signatureArr = new Array(len)
        for (let i = 0; i < len; i++)
            signatureArr[i] = (new Uint8Array(arrayBuffer))[i].toString(16)
        const signature = signatureArr.join('').toUpperCase()

        switch (signature) {
            case '89504E47':
                return 'png'
            case '47494638':
                return 'gif'
            case '25504446':
                return 'application/pdf'
            case 'FFD8FFDB':
            case 'FFD8FFE0':
                return 'jpg'
            case '504B0304':
                return 'application/zip'
            default:
                return null
        }
    }
    return null
}

function getContentType(filename: string): string {
    let extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'gif':
            return 'image/gif';
        // Add more types as needed
        default:
            return 'application/octet-stream'; // Default to a generic binary type if not recognized
    }
}

export default app
