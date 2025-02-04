/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "media",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "cloudflare",
    };
  },
  async run() {

    let domain = $app.stage === "production" ? "media.geekiam.systems" : "media-dev.geekiam.systems"
    const bucket = new sst.cloudflare.Bucket("MediaBucket");


    const media = new sst.cloudflare.Worker("Media", {
      url: true,
      link: [bucket],
      handler: "src/index.ts",
      domain: domain
    });



    return{
      api: media.url
    }
  },
});
