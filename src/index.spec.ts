import { describe, it, assert } from "vitest";
import * as bytestream from "./index";

describe("index", () => {
  it("exports the public API", () => {
    assert.deepStrictEqual(Object.keys(bytestream).sort(), ["BitStream", "ByteStream", "SeqBitStream", "SeqStream", "parseByteMap"]);
  });
});
