import { Hono } from 'hono'
import {Resource}  from "sst";
import { R2ObjectBody } from "@cloudflare/workers-types";

const app = new Hono()

    app.post("/*", async (c) => {

      const key = crypto.randomUUID();
      const body = await c.req.parseBody();
      const file = body['File'] as File;
      const fileExtension = file.name.split('.').pop();
      const uuidFilename = `${key}.${fileExtension}`;
    let result =  await Resource.MediaBucket.put(uuidFilename, await file.arrayBuffer(), {
        httpMetadata: {
          contentType: c.req.header("content-type"),
        },
      });

      return c.json({
        uuid: key,
        filename: uuidFilename}, 201);
    });


app.get("/:filename", async (c) => {
    const filename = c.req.param('filename');
    const result = await Resource.MediaBucket.get(filename) as R2ObjectBody | null;

    if (result === null) {
        return c.notFound();
    }

    if (result.body === null)
    {
        return c.notFound()
    }
    const arrayBuffer = await new Response(result.body as any).arrayBuffer();

    return c.body(arrayBuffer, 200, {
        'Content-Type': getContentType(filename), // Use your existing getContentType function
    });

})

function getContentType(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
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
