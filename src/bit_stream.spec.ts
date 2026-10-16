import { describe, it, assert } from "vitest";
import { BitStream } from "./bit_stream";
import { ByteStream } from "./byte_stream";

describe("BitStream class tests", () => {
  describe("constructor", () => {
    it("empty", () => {
      const bitStream = new BitStream();

      assert.strictEqual(bitStream.bitsCount, 0);
      assert.strictEqual(bitStream.buffer.byteLength, 0);
    });

    it("view", () => {
      const bitStream = new BitStream({ view: new Uint8Array([1, 2, 3, 4, 5]) });

      assert.strictEqual(bitStream.bitsCount, 40);
      assert.strictEqual(bitStream.buffer.byteLength, 5);
    });

    it("view with bitsCount", () => {
      const bitStream = new BitStream({
        view: new Uint8Array([1, 2, 3, 4, 5]),
        bitsCount: 35,
      });

      assert.strictEqual(bitStream.bitsCount, 35);
      assert.strictEqual(bitStream.buffer.byteLength, 5);
    });

    it("buffer", () => {
      const bitStream = new BitStream({ buffer: new Uint8Array([1, 2, 3, 4, 5]).buffer });

      assert.strictEqual(bitStream.bitsCount, 40);
      assert.strictEqual(bitStream.buffer.byteLength, 5);
    });

    it("byteStream", () => {
      const bitStream = new BitStream({ byteStream: new ByteStream({ length: 5 }) });

      assert.strictEqual(bitStream.bitsCount, 40);
      assert.strictEqual(bitStream.buffer.byteLength, 5);
    });

    it("string", () => {
      const bitStream = new BitStream({ string: "1000000000001" });

      assert.strictEqual(bitStream.bitsCount, 13);
      assert.strictEqual(bitStream.buffer.byteLength, 2);
    });

    it("uint32", () => {
      const bitStream = new BitStream({ uint32: 300 });

      assert.strictEqual(bitStream.bitsCount, 32);
      assert.strictEqual(bitStream.buffer.byteLength, 4);
    });
  });

  it("clear", () => {
    const bitStream = new BitStream({ string: "1000000000001" });
    bitStream.clear();

    assert.strictEqual(bitStream.bitsCount, 0);
    assert.strictEqual(bitStream.buffer.byteLength, 0);
  });

  describe("toString", () => {
    const bitStream = new BitStream({ string: "10000000000010000010" });

    it("default", () => {
      const bitString = bitStream.toString();
      assert.strictEqual(bitString, "10000000000010000010");
    });

    it("start: 1, length: default", () => {
      // oxlint-disable-next-line oxc/number-arg-out-of-range -- BitStream#toString(start), not Number#toString(radix)
      const bitString = bitStream.toString(1);
      assert.strictEqual(bitString, "000010000010");
    });
  });

  it("shrink", () => {
    const bitStream = new BitStream({
      uint32: 123456,
      bitsCount: 12,
    });

    bitStream.shrink();

    assert.strictEqual(bitStream.bitsCount, 12);
    assert.strictEqual(bitStream.buffer.byteLength, 2);
  });

  describe("shiftRight", () => {
    const bits = "10101010 10101010 10101".replace(/ /g, ""); // remove spaces

    it("shrink: true", () => {
      const bitStream = new BitStream({ string: bits });
      bitStream.shiftRight(7);
      assert.strictEqual(bitStream.bitsCount, 14);
      assert.strictEqual(bitStream.buffer.byteLength, 2);
      assert.strictEqual(bitStream.toString(), "10101010101010");
    });

    it("shrink: false", () => {
      const bitStream = new BitStream({ string: bits });
      bitStream.shiftRight(7, false);
      assert.strictEqual(bitStream.bitsCount, 14);
      assert.strictEqual(bitStream.buffer.byteLength, 3);
      assert.strictEqual(bitStream.toString(), "10101010101010");
    });

    it("empty view", () => {
      const bitStream = new BitStream({ view: new Uint8Array() });
      bitStream.shiftRight(7);
      assert.strictEqual(bitStream.toString(), "");
    });

    it("shift value is out of range", () => {
      const bitStream = new BitStream({ view: new Uint8Array(1) });
      assert.throws(() => {
        bitStream.shiftRight(10);
      }, Error);
    });

    it("shift value more than bitsCount", () => {
      const bitStream = new BitStream({ view: new Uint8Array(1), bitsCount: 1 });
      assert.throws(() => {
        bitStream.shiftRight(2);
      }, Error);
    });
  });

  describe("shiftLeft", () => {
    const bits = "10101010 10101010 10101".replace(/ /g, ""); // remove spaces

    it("correct", () => {
      const bitStream = new BitStream({ string: bits });
      bitStream.shiftLeft(7);
      assert.strictEqual(bitStream.bitsCount, 14);
      assert.strictEqual(bitStream.buffer.byteLength, 2);
      assert.strictEqual(bitStream.toString(), "01010101010101");
    });

    it("empty view", () => {
      const bitStream = new BitStream({ view: new Uint8Array() });
      bitStream.shiftRight(7);
      assert.strictEqual(bitStream.toString(), "");
    });

    it("shift value is out of range", () => {
      const bitStream = new BitStream({ view: new Uint8Array(1) });
      assert.throws(() => {
        bitStream.shiftRight(10);
      }, Error);
    });

    it("shift value more than bitsCount", () => {
      const bitStream = new BitStream({ view: new Uint8Array(1), bitsCount: 1 });
      assert.throws(() => {
        bitStream.shiftRight(2);
      }, Error);
    });
  });

  describe("slice", () => {
    const bits = "10101010 10101010 10101".replace(/ /g, ""); // remove spaces

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const slicedStream = bitStream.slice();
      assert.strictEqual(slicedStream.toString(), "1");
      // TODO Should it return the same bits from the source stream?
      // assert.strictEqual(slicedStream.toString(), bits);
    });

    it("start: 1, end: default", () => {
      const bitStream = new BitStream({ string: bits });
      const slicedStream = bitStream.slice(1);
      assert.strictEqual(slicedStream.toString(), ""); // TODO The same result in JS version
      // assert.strictEqual(slicedStream.toString(), "01010101010101010101");
    });

    it("start: 1, end: 10", () => {
      const bitStream = new BitStream({ string: bits });
      const slicedStream = bitStream.slice(1, 10);
      assert.strictEqual(slicedStream.toString(), "0101010101");
    });
  });

  describe("copy", () => {
    const bits = "10101010 10101010 10101".replace(/ /g, ""); // remove spaces

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const copyStream = bitStream.copy();
      assert.strictEqual(copyStream.toString(), ""); // TODO The same result in JS version
      // assert.strictEqual(slicedStream.toString(), bits);
    });

    it("start: 1, end: default", () => {
      const bitStream = new BitStream({ string: bits });
      const copyStream = bitStream.slice(1);
      assert.strictEqual(copyStream.toString(), ""); // TODO The same result in JS version
      // assert.strictEqual(slicedStream.toString(), "01010101010101010101");
    });

    it("start: 1, end: 10", () => {
      const bitStream = new BitStream({ string: bits });
      const copyStream = bitStream.slice(1, 10);
      assert.strictEqual(copyStream.toString(), "0101010101");
    });
  });

  it("reversBytes", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces

    const bitStream = new BitStream({ string: bits });
    bitStream.reverseBytes();
    assert.strictEqual(bitStream.toString(), "101011101110111111011"); // TODO Result from JS version
    // TODO Should it be like the next line?
    // assert.strictEqual(bitStream.toString(), "10110101 01111011 11111");
  });

  it("reversValue", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces

    const bitStream = new BitStream({ string: bits });
    bitStream.reverseValue();
    assert.strictEqual(bitStream.toString(), "111110111101110110101");
  });

  describe("getNumberValue", () => {
    it("4 bytes", () => {
      const bitStream = new BitStream({ uint32: 1234567890 });
      assert.strictEqual(bitStream.getNumberValue(), 1234567890);
    });

    it("length of the buffer is 0", () => {
      const bitStream = new BitStream();
      assert.strictEqual(bitStream.getNumberValue(), 0);
    });

    it("length of the buffer is gritter than 4", () => {
      const bitStream = new BitStream({ view: new Uint8Array(5) });
      assert.strictEqual(bitStream.getNumberValue(), -1);
    });
  });

  describe("findPattern", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPattern(new BitStream({ string: "111" }));
      assert.strictEqual(res, 10);
    });

    it("start: 8", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPattern(new BitStream({ string: "111" }), 10);
      assert.strictEqual(res, 14);
    });

    it("start: 8, length: 3", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPattern(new BitStream({ string: "111" }), 10, 3);
      assert.strictEqual(res, -1);
    });

    it("backward", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPattern(new BitStream({ string: "111" }), null, null, true);
      assert.strictEqual(res, 18);
    });
  });

  describe("findFirstIn", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces
    const patterns = [new BitStream({ string: "11" }), new BitStream({ string: "111" })];

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findFirstIn(patterns);
      assert.deepStrictEqual(res, {
        id: 0,
        length: 2,
        position: 6,
      });
    });
    it("backward", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findFirstIn(patterns.reverse(), null, null, true);
      assert.deepStrictEqual(res, {
        id: 1,
        length: 2,
        position: 19,
      });
    });
  });

  describe("findAllIn", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces
    const patterns = [new BitStream({ string: "11" }), new BitStream({ string: "111" })];

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllIn(patterns);
      assert.deepStrictEqual(res, [
        {
          id: 0,
          position: 6,
        },
        {
          id: 1,
          position: 10,
        },
        {
          id: 1,
          position: 14,
        },
        {
          id: 1,
          position: 19,
        },
        {
          id: 0,
          position: 21,
        },
      ]);
    });
    it("start + length", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllIn(patterns, 3, 6);
      assert.deepStrictEqual(res, [
        {
          id: 0,
          position: 6,
        },
        {
          id: 0,
          position: 9,
        },
      ]);
    });
    it("not found", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllIn(patterns, 3, 1);
      assert.deepStrictEqual(res, []);
    });
  });

  describe("findAllPatternIn", () => {
    const bits = "10101101 11011110 11111".replace(/ /g, ""); // remove spaces
    const pattern = new BitStream({ string: "111" });

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllPatternIn(pattern);
      assert.deepStrictEqual(res, [10, 14, 19]);
    });

    it("start + length", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllPatternIn(pattern, 5, 6);
      assert.deepStrictEqual(res, [10]);
    });

    it("not found", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findAllPatternIn(pattern, 5, 1);
      assert.deepStrictEqual(res, -1);
    });
  });

  describe("findFirstNotIn", () => {
    const bits = "10101101 11011110 01111".replace(/ /g, ""); // remove spaces

    it("default", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findFirstNotIn([
        new BitStream({ string: "101" }),
        new BitStream({ string: "00" }),
      ]);
      assert.deepStrictEqual(res.left, {
        id: 0,
        length: 3,
        position: 3,
      });
      assert.deepStrictEqual(res.right, {
        id: 0,
        length: 3,
        position: 8,
      });
      assert.deepStrictEqual(res.value.toString(), "01");
    });

    it("start + length", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findFirstNotIn(
        [new BitStream({ string: "01110" }), new BitStream({ string: "00" })],
        6,
        14,
      );
      assert.deepStrictEqual(res.left, {
        id: 0,
        length: 5,
        position: 11,
      });
      assert.deepStrictEqual(res.right, {
        id: 1,
        length: 2,
        position: 17,
      });
      assert.deepStrictEqual(res.value.toString(), "1111");
    });

    it("not found", () => {
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findFirstNotIn(
        [new BitStream({ string: "000" }), new BitStream({ string: "00100" })],
        6,
        14,
      );
      assert.deepStrictEqual(res.left, {
        id: -1,
        position: 6,
      });
      assert.deepStrictEqual(res.right, {
        id: -1,
        length: 0,
        position: 20,
      });
      assert.deepStrictEqual(res.value.toString(), "01110111100111");
    });
  });

  describe("findFirstSequence", () => {
    it("default", () => {
      const bits = "00000111 1100".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });

      const res = bitStream.findFirstSequence([new BitStream({ string: "1" })]);

      assert.strictEqual(res.position, 10);
      assert.strictEqual(res.value.toString(), "11111");
    });

    it("backward", () => {
      const bits = "00001110 1100".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });

      const res = bitStream.findFirstSequence([new BitStream({ string: "1" })], null, null, true);

      assert.strictEqual(res.position, 8);
      assert.strictEqual(res.value.toString(), "11");
    });

    it("start + length", () => {
      const bits = "01100001 1100".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });

      const res = bitStream.findFirstSequence([new BitStream({ string: "1" })], 4, 7);

      assert.strictEqual(res.position, 10);
      assert.strictEqual(res.value.toString(), "111");
    });

    it("not found", () => {
      const bits = "01100001 1100".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });

      const res = bitStream.findFirstSequence([new BitStream({ string: "1" })], 3, 4);

      assert.strictEqual(res.position, -1);
      assert.strictEqual(res.value.toString(), "");
    });
  });

  describe("findAllSequences", () => {
    const bits = "010110111 011110".replace(/ /g, "");
    const bitStream = new BitStream({
      string: bits,
    });

    it("default", () => {
      const res = bitStream
        .findAllSequences([new BitStream({ string: "10" }), new BitStream({ string: "01" })])
        .map((o) => {
          return { position: o.position, value: o.value.toString() };
        });
      assert.deepStrictEqual(res, [
        { position: 6, value: "010110" },
        { position: 10, value: "10" },
        { position: 15, value: "10" },
      ]);
    });

    it("start + length", () => {
      const res = bitStream
        .findAllSequences(
          [new BitStream({ string: "10" }), new BitStream({ string: "01" })],
          2,
          6,
        )
        .map((o) => {
          return { position: o.position, value: o.value.toString() };
        });
      assert.deepStrictEqual(res, [{ position: 6, value: "0110" }]);
    });

    it("not found", () => {
      const res = bitStream
        .findAllSequences(
          [new BitStream({ string: "000" }), new BitStream({ string: "00" })],
          2,
          6,
        )
        .map((o) => {
          return { position: o.position, value: o.value.toString() };
        });
      assert.deepStrictEqual(res, []);
    });
  });

  describe("findPairedPatterns", () => {
    it("default", () => {
      const bits = "00010000 00110000 0110".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedPatterns(
        new BitStream({ string: "01" }),
        new BitStream({ string: "11" }),
      );

      // TODO Double check result
      // Should it be '010000 0011' only?
      assert.deepStrictEqual(res, [
        { left: 11, right: 12 },
        { left: 18, right: 19 },
      ]);
    });

    it("start + length", () => {
      const bits = "00010000 00110000 0110".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedPatterns(
        new BitStream({ string: "01" }),
        new BitStream({ string: "11" }),
        11,
        8,
      );

      assert.deepStrictEqual(res, [{ left: 18, right: 19 }]);
    });

    it("not found", () => {
      const bits = "000000".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedPatterns(
        new BitStream({ string: "01" }),
        new BitStream({ string: "11" }),
      );

      assert.deepStrictEqual(res, []);
    });
  });

  describe("findPairedArrays", () => {
    it("default", () => {
      const bits = "00110000 001010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedArrays(
        [new BitStream({ string: "111" }), new BitStream({ string: "11" })],
        [new BitStream({ string: "1001" }), new BitStream({ string: "101" })],
      );

      assert.deepStrictEqual(res, [
        {
          left: {
            id: 1,
            position: 4,
          },
          right: {
            id: 1,
            position: 13,
          },
        },
      ]);
    });

    it("start + length", () => {
      const bits = "00110000 00101000 00110000 00101000 0011".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedArrays(
        [new BitStream({ string: "111" }), new BitStream({ string: "11" })],
        [new BitStream({ string: "1001" }), new BitStream({ string: "101" })],
        16,
        16,
      );

      assert.deepStrictEqual(res, [
        {
          left: {
            id: 1,
            position: 20,
          },
          right: {
            id: 1,
            position: 29,
          },
        },
      ]);
    });

    it("not found", () => {
      const bits = "00110000 001010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.findPairedArrays(
        [new BitStream({ string: "1111" }), new BitStream({ string: "111" })],
        [new BitStream({ string: "1001" }), new BitStream({ string: "10001" })],
      );

      assert.deepStrictEqual(res, []);
    });
  });

  describe("replacePattern", () => {
    it("default", () => {
      const bits = "00110000 00110".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.replacePattern(
        new BitStream({ string: "11" }),
        new BitStream({ string: "00" }),
      );

      assert.strictEqual(res, true);
      assert.strictEqual(bitStream.toString(), "00000000 00000".replace(/ /g, ""));
    });

    it("start + length", () => {
      const bits = "00110000 00110".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.replacePattern(
        new BitStream({ string: "11" }),
        new BitStream({ string: "00" }),
        4,
        8,
      );

      assert.strictEqual(res, true);
      assert.strictEqual(bitStream.toString(), "00110000 00000".replace(/ /g, ""));
    });

    it("not found", () => {
      const bits = "00110000 00110".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.replacePattern(
        new BitStream({ string: "111" }),
        new BitStream({ string: "000" }),
      );

      assert.strictEqual(res, true);
      // TODO Check out test result
      // assert.strictEqual(res, false);
      assert.strictEqual(bitStream.toString(), "00110000 00110".replace(/ /g, ""));
    });
  });

  describe("skipPatterns", () => {
    it("default", () => {
      const bits = "010100000 01010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipPatterns([
        new BitStream({ string: "01" }),
        new BitStream({ string: "0" }),
      ]);

      assert.strictEqual(res, 14);
    });

    it("backward", () => {
      const bits = "110100000 01010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipPatterns(
        [new BitStream({ string: "01" }), new BitStream({ string: "0" })],
        null,
        null,
        true,
      );

      assert.strictEqual(res, 2);
    });

    it("start + length", () => {
      const bits = "010100000 011100110 010101".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipPatterns(
        [new BitStream({ string: "01" }), new BitStream({ string: "0" })],
        13,
        5,
      );

      assert.strictEqual(res, 16);
    });
  });

  describe("skipNotPatterns", () => {
    it("default", () => {
      const bits = "010111000 01010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipNotPatterns([new BitStream({ string: "00" })]);

      assert.strictEqual(res, 6);
    });

    it("backward", () => {
      const bits = "110100000 01010".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipNotPatterns([new BitStream({ string: "00" })], null, null, true);

      assert.strictEqual(res, 10);
    });

    it("start + length", () => {
      const bits = "011100000 011100110 010101".replace(/ /g, "");
      const bitStream = new BitStream({ string: bits });
      const res = bitStream.skipNotPatterns([new BitStream({ string: "11" })], 4, 10);

      assert.strictEqual(res, 10);
    });
  });

  it("append", () => {
    const bitStream = new BitStream({ string: "11001110 110".replace(/ /g, "") });
    bitStream.append(new BitStream({ string: "111" }));

    assert.strictEqual(bitStream.toString(), "11001110 110111".replace(/ /g, ""));
    assert.strictEqual(bitStream.bitsCount, 14);
  });
});
