const path = require("path");
const nextBin = require.resolve("next/dist/bin/next");

process.argv = [process.argv[0], nextBin, "start", "-p", "3000"];
require("next/dist/bin/next");
