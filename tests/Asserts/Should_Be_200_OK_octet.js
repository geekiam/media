client.test("Successful request with OK 200", () => {
    client.assert(response.status === 200, "HTTP Response status code is not 200");
});

client.test("Response content-type is json", () => {
    var contentType = response.contentType.mimeType;
    client.assert(contentType === "application/octet-stream", "Expected content-type 'application/octet-stream' but received '" + contentType + "'");
});