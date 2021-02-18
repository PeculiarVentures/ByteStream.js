import { ByteStream, FindFirstNotInResult, FindFirstSequenceResult, FindPairedArraysResult, FindPairedPatternsResult } from "./byte_stream";

export interface SeqStreamParameters {
  stream?: ByteStream;
  length?: number;
  backward?: boolean;
  start?: number;
  appendBlock?: number;
  view?: Uint8Array;
  buffer?: ArrayBuffer;
  string?: string;
  hexstring?: string;
}

export class SeqStream {
  /**
   * Major stream
   */
  private _stream = new ByteStream();
  /**
   * Length of the major stream
   */
  private _length = 0;
  /**
   * Start position to search
   */
  private _start = 0;
  /**
   * Flag to search in backward direction
   */
  public backward = false;
  /**
   * Length of a block when append information to major stream
   */
  public appendBlock: number;
  public prevLength = 0;
  public prevStart = 0;

  /**
   * Constructor for "SeqStream" class
   * @param parameters
   */
  constructor(parameters: SeqStreamParameters = {}) {
    this.stream = parameters.stream ?? new ByteStream();
    if (parameters.backward) {
      this.backward = parameters.backward;
      this._start = this.stream.buffer.byteLength;
    }
    if (parameters.length) {
      this._length = parameters.length;
    }
    if (parameters.start) {
      this._start = parameters.start;
    }
    this.appendBlock = parameters.appendBlock ?? 0;
    if (parameters.view) {
      this.stream = new ByteStream({ view: parameters.view });
    }
    if (parameters.buffer) {
      this.stream = new ByteStream({ buffer: parameters.buffer });
    }
    if (parameters.string) {
      this.stream = new ByteStream({ string: parameters.string });
    }
    if (parameters.hexstring) {
      this.stream = new ByteStream({ hexstring: parameters.hexstring });
    }
  }
  /**
   * Setter for "stream" property
   */
  public set stream(value: ByteStream) {
    this._stream = value;

    this.prevLength = this._length;
    this._length = value.buffer.byteLength;

    this.prevStart = this._start;
    this._start = 0;
  }
  /**
   * Getter for "stream" property
   */
  public get stream() {
    return this._stream;
  }

  /**
   * Setter for "length" property
   * @param value
   */
  public set length(value: number) {
    this.prevLength = this._length;
    this._length = value;
  }

  /**
   * Getter for "length" property
   * @returns
   */
  public get length() {
    if (this.appendBlock) {
      return this.start;
    }

    return this._length;
  }

  /**
   * Setter for "start" property
   * @param value
   */
  public set start(value: number) {
    if (value > this.stream.buffer.byteLength)
      return;

    //#region Initialization of "prev" internal variables
    this.prevStart = this._start;
    this.prevLength = this._length;
    //#endregion

    this._length -= ((this.backward) ? (this._start - value) : (value - this._start));
    this._start = value;
  }
  /**
   * Getter for "start" property
   * @returns
   */
  public get start() {
    return this._start;
  }

  /**
   * Return ArrayBuffer with having value of existing SeqStream length
   * @return}
   */
  public get buffer() {
    return this._stream.buffer.slice(0, this._length); // TODO subarray? Or better create buffer only once
  }

  /**
   * Reset current position of the "SeqStream"
   */
  public resetPosition() {
    this._start = this.prevStart;
    this._length = this.prevLength;
  }

  /**
   * Find any byte pattern in "ByteStream"
   * @param pattern Stream having pattern value
   * @param ga Maximum gap between start position and position of nearest object
   * @returns
   */
  public findPattern(pattern: ByteStream, gap: null | number = null) {
    //#region Initial variables
    if ((gap == null) || (gap > this.length)) {
      gap = this.length;
    }
    //#endregion

    //#region Find pattern
    const result = this.stream.findPattern(pattern, this.start, this.length, this.backward);
    if (result == (-1))
      return result;

    if (this.backward) {
      if (result < (this.start - pattern.buffer.byteLength - gap)) {
        return (-1);
      }
    } else {
      if (result > (this.start + pattern.buffer.byteLength + gap)) {
        return (-1);
      }
    }
    //#endregion

    //#region Create new values
    this.start = result;
    //#endregion ;

    return result;
  }

  /**
   * Find first position of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @param ga Maximum gap between start position and position of nearest object
   * @returns
   */
  public findFirstIn(patterns: ByteStream[], gap: null | number = null) {
    //#region Initial variables
    if ((gap == null) || (gap > this.length)) {
      gap = this.length;
    }
    //#endregion

    //#region Search for patterns
    const result = this.stream.findFirstIn(patterns, this.start, this.length, this.backward);
    if (result.id == (-1))
      return result;

    if (this.backward) {
      if (result.position < (this.start - patterns[result.id].buffer.byteLength - gap)) {
        return {
          id: (-1),
          position: (this.backward) ? 0 : (this.start + this.length)
        };
      }
    } else {
      if (result.position > (this.start + patterns[result.id].buffer.byteLength + gap)) {
        return {
          id: (-1),
          position: (this.backward) ? 0 : (this.start + this.length)
        };
      }
    }
    //#endregion

    //#region Create new values
    this.start = result.position;
    //#endregion ;

    return result;
  }
  /**
   * Find all positions of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @returns
   */
  public findAllIn(patterns: ByteStream[]) {
    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this.start - this.length) : this.start;

    return this.stream.findAllIn(patterns, start, this.length);
  }
  /**
   * Find first position of data, not included in patterns from input array
   * @param patterns Array with patterns which should be omitted
   * @param gap Maximum gap between start position and position of nearest object
   * @returns
   */
  public findFirstNotIn(patterns: ByteStream[], gap: null | number = null): FindFirstNotInResult {
    if ((gap == null) || (gap > this._length)) {
      gap = this._length;
    }
    //#endregion

    //#region Search for patterns
    const result = this._stream.findFirstNotIn(patterns, this._start, this._length, this.backward);
    if ((result.left.id == (-1)) && (result.right.id == (-1))) {
      return result;
    }

    if (this.backward) {
      if (result.right.id != (-1)) {
        if (result.right.position < (this._start - patterns[result.right.id].buffer.byteLength - gap)) {
          return {
            left: {
              id: (-1),
              position: this._start
            },
            right: {
              id: (-1),
              position: 0
            },
            value: new ByteStream()
          };
        }
      }
    } else {
      if (result.left.id != (-1)) {
        if (result.left.position > (this._start + patterns[result.left.id].buffer.byteLength + gap)) {
          return {
            left: {
              id: (-1),
              position: this._start
            },
            right: {
              id: (-1),
              position: 0
            },
            value: new ByteStream()
          };
        }
      }
    }
    //#endregion

    //#region Create new values
    if (this.backward) {
      if (result.left.id == (-1)) {
        this.start = 0;
      } else {
        this.start = result.left.position;
      }
    } else {
      if (result.right.id == (-1)) {
        this.start = (this._start + this._length);
      } else {
        this.start = result.right.position;
      }
    }
    //#endregion

    return result;
  }
  /**
   * Find all positions of data, not included in patterns from input array
   * @param patterns Array with patterns which should be omitted
   * @returns
   */
  public findAllNotIn(patterns: ByteStream[]) {
    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this._start - this._length) : this._start;

    return this._stream.findAllNotIn(patterns, start, this._length);
  }
  /**
   * Find position of a sequence of any patterns from input array
   * @param patterns Array with patterns which should be omitted
   * @param length Length to search sequence for
   * @param gap Maximum gap between start position and position of nearest object
   * @returns
   */
  public findFirstSequence(patterns: ByteStream[], length: null | number = null, gap: null | number = null): FindFirstSequenceResult {
    //#region Initial variables
    if ((length == null) || (length > this._length)) {
      length = this._length;
    }

    if ((gap == null) || (gap > length)) {
      gap = length;
    }
    //#endregion

    //#region Search for sequence
    const result = this._stream.findFirstSequence(patterns, this._start, length, this.backward);
    if (result.value.buffer.byteLength == 0) {
      return result;
    }

    if (this.backward) {
      if (result.position < (this._start - result.value.buffer.byteLength - gap)) {
        return {
          position: (-1),
          value: new ByteStream()
        };
      }
    } else {
      if (result.position > (this._start + result.value.buffer.byteLength + gap)) {
        return {
          position: (-1),
          value: new ByteStream()
        };
      }
    }
    //#endregion

    //#region Create new values
    this.start = result.position;
    //#endregion ;

    return result;
  }
  /**
   * Find position of a sequence of any patterns from input array
   * @param patterns Array with patterns which should be found
   * @returns
   */
  findAllSequences(patterns: ByteStream[]): FindFirstSequenceResult[] {
    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this.start - this.length) : this.start;

    return this.stream.findAllSequences(patterns, start, this.length);
  }
  /**
   * Find all paired patterns in the stream
   * @param leftPattern Left pattern to search for
   * @param rightPattern Right pattern to search for
   * @param gap Maximum gap between start position and position of nearest object
   * @returns
   */
  public findPairedPatterns(leftPattern: ByteStream, rightPattern: ByteStream, gap: null | number = null): FindPairedPatternsResult[] {
    //#region Initial variables
    if ((gap == null) || (gap > this.length)) {
      gap = this.length;
    }
    //#endregion

    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this.start - this.length) : this.start;

    //#region Search for patterns
    const result = this.stream.findPairedPatterns(leftPattern, rightPattern, start, this.length);
    if (result.length) {
      if (this.backward) {
        if (result[0].right < (this.start - rightPattern.buffer.byteLength - gap)) {
          return [];
        }
      } else {
        if (result[0].left > (this.start + leftPattern.buffer.byteLength + gap)) {
          return [];
        }
      }
    }
    //#endregion

    return result;
  }
  /**
   * Find all paired patterns in the stream
   * @param leftPatterns Array of left patterns to search for
   * @param rightPatterns Array of right patterns to search for
   * @param gap Maximum gap between start position and position of nearest object
   * @returns
   */
  public findPairedArrays(leftPatterns: ByteStream[], rightPatterns: ByteStream[], gap: null | number = null): FindPairedArraysResult[] {
    //#region Initial variables
    if ((gap == null) || (gap > this.length)) {
      gap = this.length;
    }
    //#endregion

    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this.start - this.length) : this.start;

    //#region Search for patterns
    const result = this.stream.findPairedArrays(leftPatterns, rightPatterns, start, this.length);
    if (result.length) {
      if (this.backward) {
        if (result[0].right.position < (this.start - rightPatterns[result[0].right.id].buffer.byteLength - gap)) {
          return [];
        }
      } else {
        if (result[0].left.position > (this.start + leftPatterns[result[0].left.id].buffer.byteLength + gap)) {
          return [];
        }
      }
    }
    //#endregion

    return result;
  }
  /**
   * Replace one patter with other
   * @param searchPattern The pattern to search for
   * @param replacePattern The pattern to replace initial pattern
   * @returns
   */
  public replacePattern(searchPattern: ByteStream, replacePattern: ByteStream) {
    // In case of "backward order" the start position is at the end on stream.
    // In case of "normal order" the start position is at the begging of the stream.
    // But in fact for search for all patterns we need to have start position in "normal order".
    const start = (this.backward) ? (this.start - this.length) : this.start;

    return this.stream.replacePattern(searchPattern, replacePattern, start, this.length);
  }
  /**
   * Skip of any pattern from input array
   * @param patterns Array with patterns which should be omitted
   * @returns
   */
  public skipPatterns(patterns: ByteStream[]) {
    const result = this.stream.skipPatterns(patterns, this.start, this.length, this.backward);

    //#region Create new values
    this.start = result;
    //#endregion ;

    return result;
  }
  /**
   * Skip of any pattern from input array
   * @param patterns Array with patterns which should be omitted
   * @returns
   */
  public skipNotPatterns(patterns: ByteStream[]) {
    const result = this.stream.skipNotPatterns(patterns, this.start, this.length, this.backward);
    if (result == (-1))
      return (-1);

    //#region Create new values
    this.start = result;
    //#endregion ;

    return result;
  }
  /**
   * Append a new "Stream" content to the current "Stream"
   * @param stream A new "stream" to append to current "stream"
   */
  public append(stream: ByteStream) {
    if ((this._start + stream.buffer.byteLength) > this._stream.buffer.byteLength) {
      if (stream.buffer.byteLength > this.appendBlock) {
        this.appendBlock = (stream.buffer.byteLength + 1000);
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    this._stream.view.set(stream.view, this._start);

    this._length += (stream.buffer.byteLength * 2);
    this.start = (this._start + stream.buffer.byteLength);
    this.prevLength -= (stream.buffer.byteLength * 2);
  }
  /**
   * Append a "view" content to the current "Stream"
   * @param view A new "view" to append to current "stream"
   */
  public appendView(view: Uint8Array) {
    if ((this._start + view.length) > this._stream.buffer.byteLength) {
      if (view.length > this.appendBlock) {
        this.appendBlock = (view.length + 1000);
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    this._stream.view.set(view, this._start);

    this._length += (view.length * 2);
    this.start = (this._start + view.length);
    this.prevLength -= (view.length * 2);
  }
  /**
   * Append a new char to the current "Stream"
   * @param char A new char to append to current "stream"
   */
  public appendChar(char: number) {
    if ((this._start + 1) > this._stream.buffer.byteLength) {
      if (1 > this.appendBlock) {
        this.appendBlock = 1000;
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    this._stream.view[this._start] = char;

    this._length += 2;
    this.start = (this._start + 1);
    this.prevLength -= 2;
  }
  /**
   * Append a new number to the current "Stream"
   * @param number A new unsigned 16-bit integer to append to current "stream"
   */
  public appendUint16(number: number) {
    if ((this._start + 2) > this._stream.buffer.byteLength) {
      if (2 > this.appendBlock) {
        this.appendBlock = 1000;
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    const value = new Uint16Array([number]);
    const view = new Uint8Array(value.buffer);

    this._stream.view[this._start] = view[1];
    this._stream.view[this._start + 1] = view[0];

    this._length += 4;
    this.start = (this._start + 2);
    this.prevLength -= 4;
  }

  /**
   * Append a new number to the current "Stream"
   * @param number A new unsigned 24-bit integer to append to current "stream"
   */
  appendUint24(number: number) {
    if ((this._start + 3) > this._stream.buffer.byteLength) {
      if (3 > this.appendBlock) {
        this.appendBlock = 1000;
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    const value = new Uint32Array([number]);
    const view = new Uint8Array(value.buffer);

    this._stream.view[this._start] = view[2];
    this._stream.view[this._start + 1] = view[1];
    this._stream.view[this._start + 2] = view[0];

    this._length += 6;
    this.start = (this._start + 3);
    this.prevLength -= 6;
  }
  /**
   * Append a new number to the current "Stream"
   * @param number A new unsigned 32-bit integer to append to current "stream"
   */
  public appendUint32(number: number) {
    if ((this._start + 4) > this._stream.buffer.byteLength) {
      if (4 > this.appendBlock) {
        this.appendBlock = 1000;
      }

      this._stream.realloc(this._stream.buffer.byteLength + this.appendBlock);
    }

    const value = new Uint32Array([number]);
    const view = new Uint8Array(value.buffer);

    this._stream.view[this._start] = view[3];
    this._stream.view[this._start + 1] = view[2];
    this._stream.view[this._start + 2] = view[1];
    this._stream.view[this._start + 3] = view[0];

    this._length += 8;
    this.start = (this._start + 4);
    this.prevLength -= 8;
  }
  /**
   * Get a block of data
   * @param size Size of the data block to get
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getBlock(size: number, changeLength = true): number[] {
    //#region Check input parameters
    if (this._length <= 0) {
      return [];
    }

    if (this._length < size) {
      size = this._length;
    }
    //#endregion

    //#region Initial variables
    let result;
    //#endregion

    //#region Getting result depends on "backward" flag
    if (this.backward) {
      const buffer = this._stream.buffer.slice(this._length - size, this._length);
      const view = new Uint8Array(buffer);

      result = new Array(size);

      for (let i = 0; i < size; i++) {
        result[size - 1 - i] = view[i];
      }
    } else {
      const buffer = this._stream.buffer.slice(this._start, this._start + size);

      result = Array.from(new Uint8Array(buffer));
    }
    //#endregion

    //#region Change "length" value if needed
    if (changeLength) {
      this.start += ((this.backward) ? ((-1) * size) : size);
    }
    //#endregion

    return result;
  }
  /**
   * Get 2-byte unsigned integer value
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getUint16(changeLength = true): number {
    const block = this.getBlock(2, changeLength);

    //#region Check possibility for conversion
    if (block.length < 2)
      return 0;
    //#endregion

    //#region Convert byte array to "Uint16Array" value
    const value = new Uint16Array(1);
    const view = new Uint8Array(value.buffer);

    view[0] = block[1];
    view[1] = block[0];
    //#endregion

    return value[0];
  }
  /**
   * Get 2-byte signed integer value
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getInt16(changeLength = true): number {
    const block = this.getBlock(2, changeLength);

    //#region Check possibility for conversion
    if (block.length < 2)
      return 0;
    //#endregion

    //#region Convert byte array to "Int16Array" value
    const value = new Int16Array(1);
    const view = new Uint8Array(value.buffer);

    view[0] = block[1];
    view[1] = block[0];
    //#endregion

    return value[0];
  }
  /**
   * Get 3-byte unsigned integer value
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getUint24(changeLength = true): number {
    const block = this.getBlock(3, changeLength);

    //#region Check possibility for conversion
    if (block.length < 3)
      return 0;
    //#endregion

    //#region Convert byte array to "Uint32Array" value
    const value = new Uint32Array(1);
    const view = new Uint8Array(value.buffer);

    for (let i = 3; i >= 1; i--) {
      view[3 - i] = block[i - 1];
    }
    //#endregion

    return value[0];
  }
  /**
   * Get 4-byte unsigned integer value
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getUint32(changeLength = true): number {
    const block = this.getBlock(4, changeLength);

    //#region Check possibility for conversion
    if (block.length < 4) {
      return 0;
    }
    //#endregion

    //#region Convert byte array to "Uint32Array" value
    const value = new Uint32Array(1);
    const view = new Uint8Array(value.buffer);

    for (let i = 3; i >= 0; i--) {
      view[3 - i] = block[i];
    }
    //#endregion

    return value[0];
  }
  /**
   * Get 4-byte signed integer value
   * @param changeLength Should we change "length" and "start" value after reading the data block
   * @returns
   */
  public getInt32(changeLength = true): number {
    const block = this.getBlock(4, changeLength);

    //#region Check possibility for conversion
    if (block.length < 4)
      return 0;
    //#endregion

    //#region Convert byte array to "Int32Array" value
    const value = new Int32Array(1);
    const view = new Uint8Array(value.buffer);

    for (let i = 3; i >= 0; i--) {
      view[3 - i] = block[i];
    }
    //#endregion

    return value[0];
  }
}
