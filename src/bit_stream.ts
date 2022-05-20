import { bitsToStringArray } from "./bit";
import { ByteStream, FindFirstInResult, FindFirstNotInResult, FindFirstSequenceResult, FindPairedArraysResult, FindPairedPatternsResult, FindResult } from "./byte_stream";

export interface BitStreamViewParameters {
  view: Uint8Array;
  bitsCount?: number;
}

export interface BitStreamStreamParameters {
  byteStream: ByteStream;
  bitsCount?: number;
}

export interface BitStreamBufferParameters {
  buffer: ArrayBuffer;
  bitsCount?: number;
}

export interface BitStreamUint32Parameters {
  uint32: number;
  bitsCount?: number;
}

export interface BitStreamStringParameters {
  string: string;
  bitsCount?: number;
}

export type BitStreamParameters =
  BitStreamViewParameters |
  BitStreamStreamParameters |
  BitStreamBufferParameters |
  BitStreamUint32Parameters |
  BitStreamStringParameters;

export class BitStream {
  public buffer: ArrayBuffer;
  public view: Uint8Array;
  public bitsCount: number;

  /**
   * Constructor for "BitStream" class
   * @param parameters
   */
  constructor(parameters?: BitStreamParameters) {
    this.buffer = new ArrayBuffer(0);
    this.view = new Uint8Array(this.buffer);

    this.bitsCount = 0; // Number of bits stored in current "BitStream"

    if (parameters) {
      if ("byteStream" in parameters) {
        this.fromByteStream(parameters.byteStream);
      }
      if ("view" in parameters) {
        this.fromUint8Array(parameters.view);
      }
      if ("buffer" in parameters) {
        this.fromArrayBuffer(parameters.buffer);
      }
      if ("string" in parameters) {
        this.fromString(parameters.string);
      }
      if ("uint32" in parameters) {
        this.fromUint32(parameters.uint32);
      }
      if ("bitsCount" in parameters && parameters.bitsCount) {
        this.bitsCount = parameters.bitsCount;
      }
    }
  }
  /**
   * Clear existing stream
   */
  public clear() {
    this.buffer = new ArrayBuffer(0);
    this.view = new Uint8Array(this.buffer);

    this.bitsCount = 0;
  }
  /**
   * Initialize "BitStream" by data from existing "ByteStream"
   * @param stream
   */
  public fromByteStream(stream: ByteStream) {
    this.fromUint8Array(stream.view);
  }
  /**
   * Initialize "BitStream" object from existing "ArrayBuffer"
   * @param array The ArrayBuffer to copy from
   */
  public fromArrayBuffer(array: ArrayBuffer) {
    this.buffer = array;
    this.view = new Uint8Array(array);

    this.bitsCount = this.view.length << 3;
  }
  /**
   * Initialize "BitStream" object from existing "Uint8Array"
   * @param array The Uint8Array to copy from
   */
  public fromUint8Array(array: Uint8Array) {
    this.fromArrayBuffer(new Uint8Array(array).buffer);
  }
  /**
   * Initialize "BitStream" object from existing bit string
   * @param string The string to initialize from
   */
  public fromString(string: string) {
    //#region Initial variables
    const stringLength = string.length;

    this.buffer = new ArrayBuffer((stringLength >> 3) + ((stringLength % 8) ? 1 : 0));
    this.view = new Uint8Array(this.buffer);

    this.bitsCount = ((stringLength >> 3) + 1) << 3; // In order to handle correct shifting

    let byteIndex = 0;
    //#endregion

    //#region Convert from "bit string" to bytes
    for (let i = 0; i < stringLength; i++) {
      if (string[i] == "1")
        this.view[byteIndex] |= 1 << (7 - (i % 8));

      if (i && (((i + 1) % 8) == 0))
        byteIndex++;
    }
    //#endregion

    //#region Shift "BitStream" into correct position
    if (stringLength % 8)
      this.shiftRight(8 - (stringLength % 8));
    //#endregion

    //#region Change "bitsCount"
    this.bitsCount = stringLength;
    //#endregion
  }
  /**
   * Initialize "BitStream" object from existing uint32 number
   * @param number The string to initialize from
   */
  public fromUint32(uint32: number) {
    this.buffer = new ArrayBuffer(4);
    this.view = new Uint8Array(this.buffer);

    const value = new Uint32Array([uint32]);
    const view = new Uint8Array(value.buffer);

    for (let i = 3; i >= 0; i--)
      this.view[i] = view[3 - i];

    this.bitsCount = 32;
  }
  /**
   * Represent "BitStream" object content as a string
   * @param start Start number to convert to string from
   * @param length Length of BitStream to convert to string
   * @returns
   */
  public toString(start?: null | number, length?: null | number) {
    //#region Check input parameters
    if (start == null) {
      start = 0;
    }

    if ((start >= this.view.length) || (start < 0)) {
      start = 0;
    }

    if (length == null) {
      length = this.view.length - start;
    }

    if ((length >= this.view.length) || (length < 0)) {
      length = this.view.length - start;
    }
    //#endregion

    //#region Initial variables
    const result = [];
    //#endregion

    //#region Convert from bytes to "bit string"
    for (let i = start; i < (start + length); i++) {
      result.push(bitsToStringArray[this.view[i]]);
    }
    //#endregion

    // TODO Do we need to remove unused bits for the subarray of bits?
    // Incoming `10101010 10101010 101010` (3 bytes, 22 bits, 2 unused bits)
    // toString() -> 10101010 10101010 101010  (the same value)
    // toString(start: 1) -> 10101010  101010 (last 2 bytes without 2 unused bytes)
    // toString(start: 1, length: 1) -> 10101010  (second byte)
    return result.join("").substring((this.view.length << 3) - this.bitsCount);
  }
  /**
   * Shift entire "BitStream" value right to number of bits
   * @param shift Number of bits to shift value
   * @param needShrink Need to shrink result or not
   */
  public shiftRight(shift: number, needShrink = true) {
    //#region Check parameters
    if (this.view.length == 0) {
      return;
    }

    if ((shift < 0) || (shift > 8)) {
      throw new Error("The \"shift\" parameter must be in range 0-8");
    }

    if (shift > this.bitsCount) {
      throw new Error("The \"shift\" parameter can not be bigger than \"this.bitsCount\"");
    }
    //#endregion

    //#region Initial variables
    const shiftMask = 0xFF >> (8 - shift);
    this.view[this.view.length - 1] >>= shift;
    //#endregion

    //#region Shift value
    for (let i = (this.view.length - 2); i >= 0; i--) {
      this.view[i + 1] |= (this.view[i] & shiftMask) << (8 - shift);
      this.view[i] >>= shift;
    }
    //#endregion

    //#region Decrease number of bits stored into value
    this.bitsCount -= shift;
    if (this.bitsCount == 0) {
      this.clear();
    }
    //#endregion

    //#region Change stream size if needed
    if (needShrink) {
      this.shrink();
    }
    //#endregion
  }
  /**
   * Shift entire "BitStream" value left to number of bits
   * @param shift Number of bits to shift value
   */
  public shiftLeft(shift: number) {
    /*
     NOTE: We do not really shift value because of internal structure of "BitStream":
     all bytes inside "BitStream" are aligned to right position. So, even if we will
     really shift value to left after that we will need again shift it right to the
     same number of bits. Thus all that we do here is hiding of left bits and decreasing
     the "bitsCount" number.
     */

    //#region Check parameters
    if (this.view.length == 0) {
      return;
    }

    if ((shift < 0) || (shift > 8)) {
      throw new Error("The \"shift\" parameter must be in range 0-8");
    }

    if (shift > this.bitsCount) {
      throw new Error("The \"shift\" parameter can not be bigger than \"this.bitsCount\"");
    }
    //#endregion

    //#region Remove shifted bits
    const bitsOffset = this.bitsCount & 0x07;
    if (bitsOffset > shift) {
      this.view[0] &= 0xFF >> (bitsOffset + shift);
    } else {
      //#region Change size of buffer
      const view = this.view.slice(1);
      //#endregion

      //#region Mask item with index 0
      view[0] &= 0xFF >> (shift - bitsOffset);
      //#endregion

      //#region Store final array into current stream
      this.buffer = view.buffer;
      this.view = view;
      //#endregion
    }
    //#endregion

    //#region Decrease number of bits stored into value
    this.bitsCount -= shift;
    if (this.bitsCount == 0) {
      this.clear();
    }
    //#endregion
  }
  /**
   * Return slice of existing "BitStream"
   * @param start Start position of the slice (in bits)
   * @param end End position of the slice (in bits)
   * @returns
   */
  public slice(start = 0, end = 0): BitStream {
    //#region Make ability to pass non-value bits
    let valueShift = 0;
    if (this.bitsCount % 8) {
      valueShift = (8 - (this.bitsCount % 8));
    }

    start += valueShift;
    end += valueShift;
    //#endregion

    //#region Initial variables
    const maxEnd = (this.view.length << 3) - 1;

    if ((start < 0) || (start > maxEnd)) {
      return new BitStream(); //("Wrong start position: " + start);
    }

    if (!end) {
      end = maxEnd;
    }

    if ((end < 0) || (end > maxEnd)) {
      return new BitStream(); //("Wrong end position: " + end);
    }

    if ((end - start + 1) > this.bitsCount) {
      return new BitStream(); //("Maximum length is " + this.bitsCount);
    }

    const startIndex = start >> 3;
    const startOffset = start & 0x07;

    const endIndex = end >> 3;
    const endOffset = end & 0x07;

    const bitsLength = ((endIndex - startIndex) == 0) ? 1 : (endIndex - startIndex + 1);

    const result = new BitStream({
      buffer: this.buffer.slice(startIndex, startIndex + bitsLength),
      bitsCount: bitsLength << 3,
    });
    //#endregion

    //#region Change "start byte"
    result.view[0] &= (0xFF >> startOffset);
    //#endregion

    //#region Change "end byte"
    result.view[bitsLength] &= (0xFF << (7 - endOffset));
    //#endregion

    //#region Shift result array to right
    if (7 - endOffset) {
      result.shiftRight(7 - endOffset, false);
    }
    //#endregion

    //#region Set final number of bits
    result.bitsCount = (end - start + 1);
    //#endregion

    //#region Cut unnecessary bytes from result
    result.shrink();
    //#endregion

    return result;
  }
  /**
   * Return copy of existing "BitStream"
   * @param start Start position of the copy (in bits)
   * @param length Length of the copy (in bits)
   * @returns
   */
  public copy(start = 0, length = 0): BitStream {
    //#region Check input parameters
    const maxEnd = (this.view.length << 3) - 1;
    if ((start < 0) || (start > maxEnd)) {
      return new BitStream(); //("Wrong start position: " + start);
    }

    if (!length) {
      length = (this.view.length << 3) - start - 1;
    }

    if (length > this.bitsCount) {
      return new BitStream(); //("Maximum length is " + this.bitsCount);
    }
    //#endregion

    return this.slice(start, start + length - 1);
  }
  /**
   * Shrink unnecessary bytes in current stream accordingly to "bitsCount" value
   */
  public shrink(): void {
    const currentLength = (this.bitsCount >> 3) + ((this.bitsCount % 8) ? 1 : 0);
    if (currentLength < this.view.length) {
      //#region Change size of buffer
      const view = this.view.slice(this.view.length - currentLength, (this.view.length - currentLength) + currentLength);
      //#endregion

      //#region Store final array into current stream
      this.view = view;
      this.buffer = view.buffer;
      //#endregion
    }
  }
  /**
   * Reverse bits order in each byte in the stream
   *
   * Got it from here: http://graphics.stanford.edu/~seander/bithacks.html#ReverseByteWith32Bits
   */
  public reverseBytes(): void {
    //#region Reverse bits order in each byte in the stream
    for (let i = 0; i < this.view.length; i++) {
      this.view[i] = ((this.view[i] * 0x0802 & 0x22110) | (this.view[i] * 0x8020 & 0x88440)) * 0x10101 >> 16;
    }
    //#endregion

    //#region Shift "most significant" byte
    if (this.bitsCount % 8) {
      const currentLength = (this.bitsCount >> 3) + ((this.bitsCount % 8) ? 1 : 0);
      this.view[this.view.length - currentLength] >>= (8 - (this.bitsCount & 0x07));
    }
    //#endregion
  }
  /**
   * Reverse all bits in entire "BitStream"
   */
  public reverseValue(): void {
    const initialValue = this.toString();
    const initialValueLength = initialValue.length;

    const reversedValue = new Array(initialValueLength);

    for (let i = 0; i < initialValueLength; i++) {
      reversedValue[initialValueLength - 1 - i] = initialValue[i];
    }

    this.fromString(reversedValue.join(""));
  }
  /**
   * Trying to represent entire "BitStream" as an unsigned integer.
   * @return
   */
  public getNumberValue(): number {
    //#region Initial variables
    const byteLength = (this.view.length - 1);
    //#endregion

    //#region Check possibility for conversion
    if (byteLength > 3) {
      return (-1);
    }

    if (byteLength == (-1)) {
      return 0;
    }
    //#endregion

    //#region Convert byte array to "Uint32Array" value
    const value = new Uint32Array(1);
    const view = new Uint8Array(value.buffer);

    for (let i = byteLength; i >= 0; i--) {
      view[byteLength - i] = this.view[i];
    }
    //#endregion

    return value[0];
  }
  /**
   * Find any bit pattern in "BitStream"
   * @param pattern Stream having pattern value
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findPattern(pattern: BitStream, start?: null | number, length?: null | number, backward?: boolean): number {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString(),
    });
    const stringPattern = new ByteStream({
      string: pattern.toString()
    });
    //#endregion

    return stringStream.findPattern(stringPattern, start, length, backward);
  }
  /**
   * Find first position of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   */
  public findFirstIn(patterns: BitStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstInResult {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString(),
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findFirstIn(stringPatterns, start, length, backward);
  }
  /**
   * Find all positions of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   */
  public findAllIn(patterns: BitStream[], start?: null | number, length?: null | number): FindResult[] {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findAllIn(stringPatterns, start, length);
  }
  /**
   * Find all positions of a pattern
   * @param pattern Stream having pattern value
   * @param start Start position to search from
   * @param length Length of byte block to search at
   */
  public findAllPatternIn(pattern: BitStream, start?: null | number, length?: null | number): -1 | number[] {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });
    const stringPattern = new ByteStream({
      string: pattern.toString()
    });
    //#endregion

    return stringStream.findAllPatternIn(stringPattern, start, length);
  }
  /**
   * Find first position of data, not included in patterns from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findFirstNotIn(patterns: BitStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstNotInResult {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findFirstNotIn(stringPatterns, start, length, backward);
  }
  /**
   * Find all positions of data, not included in patterns from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns {Array}
   */
  public findAllNotIn(patterns: BitStream[], start?: null | number, length?: null | number) {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findAllNotIn(stringPatterns, start, length);
  }
  /**
   * Find position of a sequence of any patterns from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   */
  public findFirstSequence(patterns: BitStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstSequenceResult {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findFirstSequence(stringPatterns, start, length, backward);
  }
  /**
   * Find position of a sequence of any patterns from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   */
  public findAllSequences(patterns: BitStream[], start?: null | number, length?: null | number): FindFirstSequenceResult[] {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findAllSequences(stringPatterns, start, length);
  }
  /**
   * Find all paired patterns in the stream
   * @param leftPattern Left pattern to search for
   * @param rightPattern Right pattern to search for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public findPairedPatterns(leftPattern: BitStream, rightPattern: BitStream, start?: null | number, length?: null | number): FindPairedPatternsResult[] {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });
    const stringLeftPattern = new ByteStream({
      string: leftPattern.toString()
    });
    const stringRightPattern = new ByteStream({
      string: rightPattern.toString()
    });
    //#endregion

    return stringStream.findPairedPatterns(stringLeftPattern, stringRightPattern, start, length);
  }
  /**
   * Find all paired patterns in the stream
   * @param inputLeftPatterns Array of left patterns to search for
   * @param inputRightPatterns Array of right patterns to search for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   */
  public findPairedArrays(inputLeftPatterns: BitStream[], inputRightPatterns: BitStream[], start?: null | number, length?: null | number): FindPairedArraysResult[] {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringLeftPatterns = new Array(inputLeftPatterns.length);

    for (let i = 0; i < inputLeftPatterns.length; i++) {
      stringLeftPatterns[i] = new ByteStream({
        string: inputLeftPatterns[i].toString()
      });
    }

    const stringRightPatterns = new Array(inputRightPatterns.length);

    for (let i = 0; i < inputRightPatterns.length; i++) {
      stringRightPatterns[i] = new ByteStream({
        string: inputRightPatterns[i].toString()
      });
    }
    //#endregion

    return stringStream.findPairedArrays(stringLeftPatterns, stringRightPatterns, start, length);
  }
  /**
   * Replace one pattern with other
   * @param searchPattern The pattern to search for
   * @param replacePattern The pattern to replace initial pattern
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public replacePattern(searchPattern: BitStream, replacePattern: BitStream, start?: null | number, length?: null | number): boolean {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString() // TODO Don't use toString
    });
    const stringSearchPattern = new ByteStream({
      string: searchPattern.toString()
    });
    const stringReplacePattern = new ByteStream({
      string: replacePattern.toString()
    });
    //#endregion

    //#region Re-initialize existing data
    if (stringStream.replacePattern(stringSearchPattern, stringReplacePattern, start, length)) {
      this.fromString(stringStream.toString());

      return true;
    }
    //#endregion

    return false;
  }
  /**
   * Skip any pattern from input array
   * @param patterns Array with patterns which should be omitted
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   */
  public skipPatterns(patterns: BitStream[], start?: null | number, length?: null | number, backward?: boolean): number {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString()
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.skipPatterns(stringPatterns, start, length, backward);
  }
  /**
   * Skip any pattern not from input array
   * @param patterns Array with patterns which should be omitted
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   */
  public skipNotPatterns(patterns: BitStream[], start?: null | number, length?: null | number, backward?: boolean): number {
    //#region Convert "BitStream" values to "ByteStream"
    const stringStream = new ByteStream({
      string: this.toString() // TODO Don't use toString
    });

    const stringPatterns = new Array(patterns.length);

    for (let i = 0; i < patterns.length; i++) {
      stringPatterns[i] = new ByteStream({
        string: patterns[i].toString()
      });
    }
    //#endregion

    return stringStream.skipNotPatterns(stringPatterns, start, length, backward);
  }
  /**
   * Append a new "BitStream" content to the current "BitStream"
   * @param stream A new "stream" to append to current "stream"
   */
  public append(stream: BitStream) {
    //#region Initialize current stream with new data
    this.fromString([
      this.toString(),
      stream.toString()
    ].join(""));
    //#endregion
  }
}
