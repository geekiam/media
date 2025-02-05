/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "media",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
    };
  },
  async run() {

    let domain = $app.stage === "production" ? "media.geekiam.systems" : `media-${$app.stage}.geekiam.systems`


    let bucket = new sst.cloudflare.Bucket("Bucket");


    let media = new sst.cloudflare.Worker("Media", {
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
