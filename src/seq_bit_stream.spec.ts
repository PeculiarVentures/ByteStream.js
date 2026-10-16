import { describe, it, assert } from "vitest";
import { BitStream } from "./bit_stream";
import { SeqBitStream } from "./seq_bit_stream";

describe("SeqBitStream class tests", () => {
  describe("constructor", () => {
    it("default", () => {
      const seqBitStream = new SeqBitStream();
      assert.strictEqual(seqBitStream.length, 0);
      assert.strictEqual(seqBitStream.appendBlock, 0);
      assert.strictEqual(seqBitStream.backward, false);
      assert.strictEqual(seqBitStream.start, 0);
    });

    it("stream", () => {
      const bitStream = new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) });
      const seqBitStream = new SeqBitStream({ stream: bitStream });

      assert.strictEqual(bitStream.bitsCount, seqBitStream.length);
      assert.strictEqual(seqBitStream.appendBlock, 0);
      assert.strictEqual(seqBitStream.backward, false);
      assert.strictEqual(seqBitStream.start, 0);
    });
  });

  it("getBits", () => {
    const seqBitStream = new SeqBitStream({
      stream: new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) }),
    });

    let bits = seqBitStream.getBits(2);
    assert.strictEqual(bits.bitsCount, 2);
    assert.strictEqual(bits.toString(), "00");

    bits = seqBitStream.getBits(2);
    assert.strictEqual(bits.bitsCount, 2);
    assert.strictEqual(bits.toString(), "00");

    bits = seqBitStream.getBits(100);
    assert.strictEqual(bits.bitsCount, 36);
    assert.strictEqual(bits.toString(), "000100000010000000110000010000000101");
  });

  it("getBitsString", () => {
    const seqBitStream = new SeqBitStream({
      stream: new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) }),
    });

    let bits = seqBitStream.getBitsString(2);
    assert.strictEqual(bits, "00");

    bits = seqBitStream.getBitsString(2);
    assert.strictEqual(bits, "00");

    bits = seqBitStream.getBitsString(100);
    assert.strictEqual(bits, "000100000010000000110000010000000101");
  });

  it("getBitsReversedValue", () => {
    const seqBitStream = new SeqBitStream({
      stream: new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) }),
    });

    let bits = seqBitStream.getBitsReversedValue(2);
    assert.strictEqual(bits, 0);

    bits = seqBitStream.getBitsReversedValue(2);
    assert.strictEqual(bits, 0);

    bits = seqBitStream.getBitsReversedValue(100);
    assert.strictEqual(bits, -1);
  });

  it("toString", () => {
    const seqBitStream = new SeqBitStream({
      stream: new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) }),
    });

    assert.strictEqual(seqBitStream.toString(), "0000000100000010000000110000010000000101");
  });
});
