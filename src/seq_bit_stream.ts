import { bitsToStringArray } from "./bit";
import { BitStream } from "./bit_stream";

export interface SeqBitStreamParameters {
  backward?: boolean;
  length?: number;
  start?: number;
  appendBlock?: number;
  stream?: BitStream;

}

export class SeqBitStream {
  private _length = 0;
  private _start = 0;
  private _stream!: BitStream;
  public prevLength = 0;
  public prevStart = 0;
  public backward: boolean;
  public appendBlock: number;

  constructor(parameters: SeqBitStreamParameters = {}) {
    //#region Internal variables
    this.stream = parameters.stream?.slice() || new BitStream();
    this.appendBlock = parameters.appendBlock || 0;
    if (parameters.start && parameters.start > 0) {
      this.start = parameters.start;
    }
    if (parameters.length && parameters.length > 0) {
      this.length = parameters.length;
    }
    this.backward = parameters.backward || false;
    //#endregion
  }
  public set start(value: number) {
    if (value > this.stream.bitsCount) {
      return;
    }

    this._length -= ((this.backward) ? (this._start - value) : (value - this._start));
    this._start = value;

    //#region Initialization of "prev" internal variables
    this.prevStart = this._start;
    this.prevLength = this._length;
    //#endregion
  }
  public get start(): number {
    return this._start;
  }
  public set length(value: number) {
    if (value > this.stream.bitsCount) {
      return;
    }

    this.prevLength = this._length;
    this._length = value;
  }
  public get length(): number {
    return this._length;
  }

  public set stream(value: BitStream) {
    this._stream = value;

    this.prevLength = this._length;
    this._length = value.bitsCount;

    this.prevStart = this._start;
    this._start = (this.backward) ? this.length : 0;
  }
  public get stream() {
    return this._stream;
  }
  /**
   * Get next "length" bits from the stream
   * @param length Number of bits to read
   * @returns
   */
  public getBits(length: number): BitStream {
    //#region Check input parameters
    if ((this.start + length) > this.stream.bitsCount) {
      length = (this.stream.bitsCount - this.start);
    }
    //#endregion

    //#region Initial variables
    let result;
    //#endregion

    //#region Copy necessary length of bits
    if (this.backward) {
      result = this.stream.copy(this.start - length, length);
      this.start -= result.bitsCount;
    } else {
      result = this.stream.copy(this.start, length);
      this.start += result.bitsCount;
    }
    //#endregion

    return result;
  }
  /**
   * Get string representation for the next "length" bits from the stream
   * @param length Number of bits to read
   * @returns
   */
  public getBitsString(length: number): string {
    //#region Check input parameters
    if ((this.start + length) > this.stream.bitsCount) {
      length = (this.stream.bitsCount - this.start);
    }
    //#endregion

    //#region Initial variables
    const result: string[] = [];

    let start;

    if (this.backward) {
      start = this.start - length;
    } else {
      start = this.start;
    }

    let end = this.start + length - 1;

    //#region Make ability to pass non-value bits
    let valueShift = 0;
    if (this.stream.bitsCount % 8) {
      valueShift = (8 - (this.stream.bitsCount % 8));
    }

    start += valueShift;
    end += valueShift;
    //#endregion

    const startIndex = start >> 3;
    const startOffset = start & 0x07;

    const endIndex = end >> 3;
    const endOffset = end & 0x07;

    const bitsLengthIndex = startIndex + (((endIndex - startIndex) == 0) ? 1 : (endIndex - startIndex + 1));
    //#endregion

    //#region Get string representation of bits
    for (let i = startIndex; i < bitsLengthIndex; i++) {
      let value = bitsToStringArray[this.stream.view[i]];

      if (i == startIndex) {
        value = value.substring(startOffset);
      }

      if (i == (bitsLengthIndex - 1)) {
        value = value.substr(0, endOffset - 7 + value.length);
      }

      result.push(value);
    }

    const textResult = result.join("");
    //#endregion

    //#region Change internal values
    if (this.backward) {
      this.start -= textResult.length;
    } else {
      this.start += textResult.length;
    }
    //#endregion

    return textResult;
  }
  /**
   * Get number value representation of the next "length" bits from the stream, preliminary reversed
   * @param length Number of bits to read
   * @returns
   */
  public getBitsReversedValue(length: number): number {
    //#region Initial variables
    const initialValue = this.getBitsString(length);
    const initialValueLength = initialValue.length;

    let byteIndex;

    const initialOffset = 8 - (initialValueLength % 8);

    const reversedValue = new Array(initialValueLength);

    const value = new Uint32Array(1);
    const valueView = new Uint8Array(value.buffer, 0, 4);

    let i;

    if (initialValueLength > 32) {
      return (-1);
    }

    if (length == 32) {
      byteIndex = 3;
    } else {
      byteIndex = ((initialValueLength - 1) >> 3);
    }
    //#endregion

    //#region Reverse value
    for (i = 0; i < initialValueLength; i++) {
      reversedValue[initialValueLength - 1 - i] = initialValue[i];
    }
    //#endregion

    //#region Convert byte array to "Uint32Array" value
    for (i = initialOffset; i < (initialOffset + initialValueLength); i++) {
      if (reversedValue[i - initialOffset] == "1") {
        valueView[byteIndex] |= 0x01 << (7 - (i % 8));
      }

      if (i && (((i + 1) % 8) == 0)) {
        byteIndex--;
      }
    }
    //#endregion

    return value[0];
  }
  /**
   * Represent remaining bits in "BitStream" as a string
   * @return
   */
  public toString(): string {
    const streamToDisplay = this.stream.copy(this.start, this.length);

    return streamToDisplay.toString();
  }
}