import { Hono } from 'hono'
import {Resource}  from "sst";
import { R2ObjectBody } from "@cloudflare/workers-types";
import {cors} from "hono/cors";


const app = new Hono()
    app.use('/*', cors())
    app.post("/*", async (c) => {

          let key = crypto.randomUUID();
      let body = await c.req.parseBody();
      let file = body['File'] as File;
      let fileExtension = file.name.split('.').pop();
      let uuidFilename = `${key}.${fileExtension}`;
      await Resource.Bucket.put(`${uuidFilename}`, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: c.req.header("content-type"),
        },
      });

      return c.json({
        uuid: key,
        filename: `${uuidFilename}`
      }, 201);
    });


app.get("/:filename", async (c) => {
    const filename = c.req.param('filename');

    const result = await Resource.Bucket.get(filename) as R2ObjectBody | null;

    if (result === null) {
        return c.notFound();
    }

    if (result.body === null)
    {
        return c.notFound()
    }



    c.header("content-type",  getContentType(filename));
    // @ts-ignore
    const arrayBuffer = await new Response(result.body).arrayBuffer();
    return c.body(arrayBuffer, 200);


})

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
