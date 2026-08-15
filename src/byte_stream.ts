export interface ByteStreamEmptyParameters {
  readonly wildcard?: number;
}
export interface ByteStreamLengthParameters extends ByteStreamEmptyParameters {
  readonly length: number;
  readonly stub?: number;
}
export interface ByteStreamViewParameters extends ByteStreamEmptyParameters {
  readonly view: Uint8Array;
}

export interface ByteStreamBufferParameters extends ByteStreamEmptyParameters {
  readonly buffer: ArrayBuffer;
}

export interface ByteStreamStringParameters extends ByteStreamEmptyParameters {
  readonly string: string;
}

export interface ByteStreamHexParameters extends ByteStreamEmptyParameters {
  readonly hexstring: string;
}

export type ByteStreamParameters =
  ByteStreamEmptyParameters |
  ByteStreamLengthParameters |
  ByteStreamViewParameters |
  ByteStreamBufferParameters |
  ByteStreamStringParameters |
  ByteStreamHexParameters;

export interface FindResult {
  id: number;
  position: number;
  length?: number;
}

export interface FindFirstInResult {
  /**
   * Index of the pattern in the list of the patterns
   */
  id: number;
  /**
   * Position after the pattern found
   */
  position: number;
  length: number;
}

export interface FindFirstNotInResult {
  left: FindResult;
  right: FindResult;
  value: ByteStream;
}

export interface FindPairedPatternsResult {
  left: number;
  right: number;
}

export interface FindPairedArraysResult {
  left: FindResult;
  right: FindResult;
}

export interface FindFirstSequenceResult {
  position: number;
  value: ByteStream;
}

export interface ReplacePatternResult {
  status: number;
  searchPatternPositions: number[];
  replacePatternPositions: number[];
}

export class ByteStream {

  private _buffer!: ArrayBuffer;
  private _view!: Uint8Array;

  /**
   * Constructor for ByteStream class
   * @param parameters
   */
  constructor(readonly parameters: ByteStreamParameters = {}) {
    if ("view" in parameters) {
      this.fromUint8Array(parameters.view);
    } else if ("buffer" in parameters) {
      this.fromArrayBuffer(parameters.buffer);
    } else if ("string" in parameters) {
      this.fromString(parameters.string);
    } else if ("hexstring" in parameters) {
      this.fromHexString(parameters.hexstring);
    } else {
      if ("length" in parameters && parameters.length > 0) {
        this.length = parameters.length;
        if (parameters.stub) {
          for (let i = 0; i < this._view.length; i++) {
            this._view[i] = parameters.stub;
          }
        }
      } else {
        this.length = 0;
      }
    }
  }

  /**
   * Setter for "buffer"
   * @param value
   */
  public set buffer(value) {
    this._buffer = value;
    this._view = new Uint8Array(this._buffer);
  }

  /**
   * Getter for "buffer"
   */
  public get buffer() {
    return this._buffer;
  }

  /**
   * Setter for "view"
   * @param value
   */
  public set view(value: Uint8Array) {
    this._buffer = new ArrayBuffer(value.length);
    this._view = new Uint8Array(this._buffer);

    this._view.set(value);
  }

  /**
   * Getter for "view"
   */
  public get view() {
    return this._view;
  }

  /**
   * Getter for "length"
   */
  public get length(): number {
    return this.view.byteLength;
  }

  /**
   * Setter for "length"
   * @param value
   */
  public set length(value: number) {
    this._buffer = new ArrayBuffer(value);
    this._view = new Uint8Array(this._buffer);
  }

  /**
   * Clear existing stream
   */
  public clear() {
    this._buffer = new ArrayBuffer(0);
    this._view = new Uint8Array(this._buffer);
  }

  /**
   * Initialize "Stream" object from existing "ArrayBuffer"
   * @param array The ArrayBuffer to copy from
   */
  public fromArrayBuffer(array: ArrayBuffer) {
    this._buffer = array;
    this._view = new Uint8Array(this._buffer);
  }

  /**
   * Initialize "Stream" object from existing "Uint8Array"
   * @param  array The Uint8Array to copy from
   */
  public fromUint8Array(array: Uint8Array) {
    this.fromArrayBuffer(new Uint8Array(array).buffer);
  }

  /**
   * Initialize "Stream" object from existing string
   * @param string The string to initialize from
   */
  public fromString(string: string) {
    const stringLength = string.length;

    this.length = stringLength;

    for (let i = 0; i < stringLength; i++)
      this.view[i] = string.charCodeAt(i);
  }

  /**
   * Represent "Stream" object content as a string
   * @param start Start position to convert to string
   * @param length Length of array to convert to string
   * @returns
   */
  public toString(start = 0, length = (this.view.length - start)) {
    //#region Initial variables
    let result = "";
    //#endregion

    //#region Check input parameters
    if ((start >= this.view.length) || (start < 0)) {
      start = 0;
    }

    if ((length >= this.view.length) || (length < 0)) {
      length = this.view.length - start;
    }
    //#endregion

    //#region Convert array of bytes to string
    for (let i = start; i < (start + length); i++)
      result += String.fromCharCode(this.view[i]);
    //#endregion

    return result;
  }

  /**
   * Initialize "Stream" object from existing hexdecimal string
   * @param hexString String to initialize from
   */
  public fromHexString(hexString: string) {
    //#region Initial variables
    const stringLength = hexString.length;

    this.buffer = new ArrayBuffer(stringLength >> 1);
    this.view = new Uint8Array(this.buffer);

    const hexMap = new Map();

    hexMap.set("0", 0x00);
    hexMap.set("1", 0x01);
    hexMap.set("2", 0x02);
    hexMap.set("3", 0x03);
    hexMap.set("4", 0x04);
    hexMap.set("5", 0x05);
    hexMap.set("6", 0x06);
    hexMap.set("7", 0x07);
    hexMap.set("8", 0x08);
    hexMap.set("9", 0x09);
    hexMap.set("A", 0x0A);
    hexMap.set("a", 0x0A);
    hexMap.set("B", 0x0B);
    hexMap.set("b", 0x0B);
    hexMap.set("C", 0x0C);
    hexMap.set("c", 0x0C);
    hexMap.set("D", 0x0D);
    hexMap.set("d", 0x0D);
    hexMap.set("E", 0x0E);
    hexMap.set("e", 0x0E);
    hexMap.set("F", 0x0F);
    hexMap.set("f", 0x0F);

    let j = 0;
    let temp = 0x00;
    //#endregion

    //#region Convert char-by-char
    for (let i = 0; i < stringLength; i++) {
      if (!(i % 2)) {
        temp = hexMap.get(hexString.charAt(i)) << 4;
      } else {
        temp |= hexMap.get(hexString.charAt(i));

        this.view[j] = temp;
        j++;
      }
    }
    //#endregion
  }

  /**
   * Represent "Stream" object content as a hexadecimal string
   * @param start Start position to convert to string
   * @param length Length of array to convert to string
   * @returns
   */
  public toHexString(start = 0, length = (this.view.length - start)) {
    //#region Initial variables
    let result = "";
    //#endregion

    //#region Check input parameters
    if ((start >= this.view.length) || (start < 0)) {
      start = 0;
    }

    if ((length >= this.view.length) || (length < 0)) {
      length = this.view.length - start;
    }
    //#endregion

    for (let i = start; i < (start + length); i++) {
      const str = this.view[i].toString(16).toUpperCase();
      result = result + ((str.length == 1) ? "0" : "") + str;
    }

    return result;
  }

  /**
   * Return copy of existing "Stream"
   * @param start Start position of the copy
   * @param length Length of the copy
   */
  public copy(start = 0, length = (this.length - start)) {
    //#region Check input parameters
    if (!start && !this.length) {
      return new ByteStream();
    }

    if ((start < 0) || (start > (this.length - 1))) {
      throw new Error(`Wrong start position: ${start}`);
    }
    //#endregion

    const stream = new ByteStream({
      buffer: this._buffer.slice(start, start + length)
    });

    return stream;
  }

  /**
   * Return slice of existing "Stream"
   * @param start Start position of the slice
   * @param end End position of the slice
   * @returns
   */
  public slice(start = 0, end = this.length) {
    //#region Check input parameters
    if (!start && !this.length) {
      return new ByteStream();
    }

    if ((start < 0) || (start > (this.length - 1))) {
      throw new Error(`Wrong start position: ${start}`);
    }
    //#endregion

    const stream = new ByteStream({
      buffer: this._buffer.slice(start, end),
    });

    return stream;
  }

  /**
   * Change size of existing "Stream"
   * @param size Size for new "Stream"
   */
  public realloc(size: number) {
    //#region Initial variables
    const buffer = new ArrayBuffer(size);
    const view = new Uint8Array(buffer);
    //#endregion

    //#region Create a new ArrayBuffer content
    if (size > this._view.length)
      view.set(this._view);
    else {
      view.set(new Uint8Array(this._buffer, 0, size));
    }
    //#endregion

    //#region Initialize "Stream" with new "ArrayBuffer"
    this._buffer = buffer;
    this._view = new Uint8Array(this._buffer);
    //#endregion
  }

  /**
   * Append a new "Stream" content to the current "Stream"
   * @param stream A new "stream" to append to current "stream"
   */
  public append(stream: ByteStream) {
    //#region Initial variables
    const initialSize = this.length;
    const streamViewLength = stream.length;

    const subarrayView = stream._view.subarray();
    //#endregion

    //#region Re-allocate current internal buffer
    this.realloc(initialSize + streamViewLength);
    //#endregion

    //#region Copy input stream content to a new place
    this._view.set(subarrayView, initialSize);
    //#endregion
  }

  /**
   * Insert "Stream" content to the current "Stream" at specific position
   * @param stream A new "stream" to insert to current "stream"
   * @param start Start position to insert to
   * @param length
   * @returns
   */
  public insert(stream: ByteStream, start = 0, length = (this.length - start)) {
    //#region Initial variables
    if (start > (this.length - 1))
      return false;

    if (length > (this.length - start)) {
      length = this.length - start;
    }
    //#endregion

    //#region Check input variables
    if (length > stream.length) {
      length = stream.length;
    }
    //#endregion

    //#region Update content of the current stream
    if (length == stream.length)
      this._view.set(stream._view, start);
    else {
      this._view.set(stream._view.subarray(0, length), start);
    }
    //#endregion

    return true;
  }

  /**
   * Check that two "Stream" objects has equal content
   * @param stream Stream to compare with
   * @returns
   */
  public isEqual(stream: ByteStream) {
    //#region Check length of both buffers
    if (this.length != stream.length)
      return false;
    //#endregion

    //#region Compare each byte of both buffers
    for (let i = 0; i < stream.length; i++) {
      if (this.view[i] != stream.view[i])
        return false;
    }
    //#endregion

    return true;
  }

  /**
   * Check that current "Stream" objects has equal content with input "Uint8Array"
   * @param view View to compare with
   * @returns
   */
  public isEqualView(view: Uint8Array) {
    //#region Check length of both buffers
    if (view.length != this.view.length)
      return false;
    //#endregion

    //#region Compare each byte of both buffers
    for (let i = 0; i < view.length; i++) {
      if (this.view[i] != view[i])
        return false;
    }
    //#endregion

    return true;
  }

  /**
   * Find any byte pattern in "Stream"
   * @param pattern Stream having pattern value
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findPattern(pattern: ByteStream, start?: null | number, length?: null | number, backward?: boolean): number;
  public findPattern(pattern: ByteStream, start_?: null | number, length_?: null | number, backward_?: boolean): number {
    //#region Initial variables
    const { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);
    const patternLength = pattern.length;
    if (patternLength > length) {
      return (-1);
    }
    //#endregion

    //#region Make a "pre-read" array for pattern
    const patternArray: number[] = [];
    for (let i = 0; i < patternLength; i++)
      patternArray.push(pattern.view[i]);
    //#endregion

    //#region Search for pattern
    for (let i = 0; i <= (length - patternLength); i++) {
      let equal = true;
      const equalStart = (backward) ? (start - patternLength - i) : (start + i);

      for (let j = 0; j < patternLength; j++) {
        if (pattern.parameters.wildcard === patternArray[j]) {
          continue;
        }
        if (this.view[j + equalStart] != patternArray[j]) {
          equal = false;
          break;
        }
      }

      if (equal) {
        return (backward) ? (start - patternLength - i) : (start + patternLength + i); // Position after the pattern found
      }
    }
    //#endregion

    return (-1);
  }

  /**
   * Find first position of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findFirstIn(patterns: ByteStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstInResult;
  public findFirstIn(patterns: ByteStream[], start_?: null | number, length_?: null | number, backward_?: boolean): FindFirstInResult {
    const { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);

    const result: FindFirstInResult = {
      id: (-1),
      position: (backward) ? 0 : (start + length),
      length: 0
    };
    //#endregion

    for (let i = 0; i < patterns.length; i++) {
      const position = this.findPattern(patterns[i], start, length, backward);
      if (position != (-1)) {
        let valid = false;
        const patternLength = patterns[i].length;

        if (backward) {
          if ((position - patternLength) >= (result.position - result.length))
            valid = true;
        } else {
          if ((position - patternLength) <= (result.position - result.length))
            valid = true;
        }

        if (valid) {
          result.position = position;
          result.id = i;
          result.length = patternLength;
        }
      }
    }

    return result;
  }

  /**
   * Find all positions of any pattern from input array
   * @param patterns Array with patterns which should be found
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public findAllIn(patterns: ByteStream[], start?: null | number, length?: null | number): FindResult[];
  public findAllIn(patterns: ByteStream[], start_?: null | number, length_?: null | number) {
  // eslint-disable-next-line prefer-const
  let { start, length } = this.prepareFindParameters(start_, length_);

    const result: FindResult[] = [];

    let patternFound = {
      id: (-1),
      position: start
    };

    //#region Find all occurrences of patterns
    do {
      const position = patternFound.position;

      patternFound = this.findFirstIn(patterns, patternFound.position, length);

      if (patternFound.id == (-1)) {
        break;
      }

      length -= (patternFound.position - position);

      result.push({
        id: patternFound.id,
        position: patternFound.position
      });
    } while (true);
    //#endregion

    return result;
  }

  /**
   * Find all positions of a pattern
   * @param pattern Stream having pattern value
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns Array with all pattern positions or (-1) if failed
   */
  // TODO throw Error instead of -1
  public findAllPatternIn(pattern: ByteStream, start?: null | number, length?: null | number): -1 | number[];
  public findAllPatternIn(pattern: ByteStream, start_?: null | number, length_?: null | number): -1 | number[] {
    const { start, length } = this.prepareFindParameters(start_, length_);

    //#region Initial variables
    const result: number[] = [];

    const patternLength = pattern.length;
    if (patternLength > length) {
      return (-1);
    }
    //#endregion

    //#region Make a "pre-read" array for pattern
    const patternArray = Array.from(pattern.view);
    //#endregion

    //#region Search for pattern
    for (let i = 0; i <= (length - patternLength); i++) {
      let equal = true;
      const equalStart = start + i;

      for (let j = 0; j < patternLength; j++) {
        if (this.view[j + equalStart] != patternArray[j]) {
          equal = false;
          break;
        }
      }

      if (equal) {
        result.push(start + patternLength + i); // Position after the pattern found
        i += (patternLength - 1); // On next step of "for" we will have "i++"
      }
    }
    //#endregion

    return result;
  }

  /**
   * Find first position of data, not included in patterns from input array
   * @param patterns Array with patterns which should be ommited
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findFirstNotIn(patterns: ByteStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstNotInResult;
  public findFirstNotIn(patterns: ByteStream[], start_?: null | number, length_?: null | number, backward_?: boolean): FindFirstNotInResult {
    // eslint-disable-next-line prefer-const
    let { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);

    const result: FindFirstNotInResult = {
      left: {
        id: (-1),
        position: start
      },
      right: {
        id: (-1),
        position: 0
      },
      value: new ByteStream()
    };

    let currentLength = length;
    //#endregion

    while (currentLength > 0) {
      //#region Search for nearest "pattern"
      result.right = this.findFirstIn(patterns,
        (backward) ? (start - length + currentLength) : (start + length - currentLength),
        currentLength,
        backward);
      //#endregion

      //#region No pattern at all
      if (result.right.id == (-1)) {
        length = currentLength;

        if (backward) {
          start -= length;
        } else {
          start = result.left.position;
        }

        result.value = new ByteStream({
          buffer: this._buffer.slice(start, start + length),
        });

        break;
      }
      //#endregion

      //#region Check distance between two patterns
      if (result.right.position != ((backward) ? (result.left.position - patterns[result.right.id].length) : (result.left.position + patterns[result.right.id].length))) {
        if (backward) {
          start = result.right.position + patterns[result.right.id].length;
          length = result.left.position - result.right.position - patterns[result.right.id].length;
        } else {
          start = result.left.position;
          length = result.right.position - result.left.position - patterns[result.right.id].length;
        }

        result.value = new ByteStream({
          buffer: this._buffer.slice(start, start + length),
        });

        break;
      }
      //#endregion

      //#region Store information about previous pattern
      result.left = result.right;
      //#endregion

      //#region Change current length
      currentLength -= patterns[result.right.id].length;
      //#endregion
    }

    //#region Swap "patterns" in case of backward order
    if (backward) {
      const temp = result.right;
      result.right = result.left;
      result.left = temp;
    }
    //#endregion

    return result;
  }

  /**
   * Find all positions of data, not included in patterns from input array
   * @param patterns Array with patterns which should be omitted
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public findAllNotIn(patterns: ByteStream[], start?: null | number, length?: null | number): FindFirstNotInResult[];
  public findAllNotIn(patterns: ByteStream[], start_?: null | number, length_?: null | number): FindFirstNotInResult[] {
    //#region Initial variables
    // eslint-disable-next-line prefer-const
    let { start, length } = this.prepareFindParameters(start_, length_);
    const result: FindFirstNotInResult[] = [];

    let patternFound: FindFirstNotInResult = {
      left: {
        id: (-1),
        position: start
      },
      right: {
        id: (-1),
        position: start
      },
      value: new ByteStream()
    };
    //#endregion

    //#region Find all occurrences of patterns
    do {
      const position = patternFound.right.position;

      patternFound = this.findFirstNotIn(patterns, patternFound.right.position, length);

      length -= (patternFound.right.position - position);

      result.push({
        left: {
          id: patternFound.left.id,
          position: patternFound.left.position
        },
        right: {
          id: patternFound.right.id,
          position: patternFound.right.position
        },
        value: patternFound.value
      });
    } while (patternFound.right.id != (-1));
    //#endregion

    return result;
  }

  /**
   * Find position of a sequence of any patterns from input array
   * @param patterns Array of pattern to look for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param backward Flag to search in backward order
   * @returns
   */
  public findFirstSequence(patterns: ByteStream[], start?: null | number, length?: null | number, backward?: boolean): FindFirstSequenceResult;
  public findFirstSequence(patterns: ByteStream[], start_?: null | number, length_?: null | number, backward_?: boolean): FindFirstSequenceResult {
    //#region Initial variables
    // eslint-disable-next-line prefer-const
    let { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);
    //#endregion

    //#region Find first byte from sequence
    const firstIn = this.skipNotPatterns(patterns, start, length, backward);
    if (firstIn == (-1)) {
      return {
        position: (-1),
        value: new ByteStream()
      };
    }
    //#endregion

    //#region Find first byte not in sequence
    const firstNotIn = this.skipPatterns(patterns,
      firstIn,
      length - ((backward) ? (start - firstIn) : (firstIn - start)),
      backward);
    //#endregion

    //#region Make output value
    if (backward) {
      start = firstNotIn;
      length = (firstIn - firstNotIn);
    } else {
      start = firstIn;
      length = (firstNotIn - firstIn);
    }

    const value = new ByteStream({
      buffer: this._buffer.slice(start, start + length),
    });
    //#endregion

    return {
      position: firstNotIn,
      value
    };
  }

  /**
   * Find all positions of a sequence of any patterns from input array
   * @param patterns Array of patterns to search for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public findAllSequences(patterns: ByteStream[], start?: null | number, length?: null | number): FindFirstSequenceResult[];
  public findAllSequences(patterns: ByteStream[], start_?: null | number, length_?: null | number): FindFirstSequenceResult[] {
    //#region Initial variables
    // eslint-disable-next-line prefer-const
    let { start, length } = this.prepareFindParameters(start_, length_);
    const result: FindFirstSequenceResult[] = [];

    let patternFound = {
      position: start,
      value: new ByteStream()
    };
    //#endregion

    //#region Find all occurrences of patterns
    do {
      const position = patternFound.position;

      patternFound = this.findFirstSequence(patterns, patternFound.position, length);

      if (patternFound.position != (-1)) {
        length -= (patternFound.position - position);

        result.push({
          position: patternFound.position,
          value: patternFound.value,
        });
      }

    } while (patternFound.position != (-1));
    //#endregion

    return result;
  }

  /**
   * Find all paired patterns in the stream
   * @param leftPattern Left pattern to search for
   * @param rightPattern Right pattern to search for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  findPairedPatterns(leftPattern: ByteStream, rightPattern: ByteStream, start?: null | number, length?: null | number): FindPairedPatternsResult[];
  findPairedPatterns(leftPattern: ByteStream, rightPattern: ByteStream, start_?: null | number, length_?: null | number): FindPairedPatternsResult[] {
    //#region Initial variables
    const result: FindPairedPatternsResult[] = [];

    if (leftPattern.isEqual(rightPattern))
      return result;

    const { start, length } = this.prepareFindParameters(start_, length_);
    let currentPositionLeft = 0;
    //#endregion

    //#region Find all "left patterns" as sorted array
    const leftPatterns = this.findAllPatternIn(leftPattern, start, length); // TODO multiple type result [number or Array]
    if (!Array.isArray(leftPatterns) || leftPatterns.length == 0) {
      return result;
    }
    //#endregion

    //#region Find all "right patterns" as sorted array
    const rightPatterns = this.findAllPatternIn(rightPattern, start, length); // TODO multiple type result [number or Array]
    if (!Array.isArray(rightPatterns) || rightPatterns.length == 0) {
      return result;
    }
    //#endregion

    //#region Combine patterns
    while (currentPositionLeft < leftPatterns.length) {
      if (rightPatterns.length == 0) {
        break;
      }

      if (leftPatterns[0] == rightPatterns[0]) {
        // Possible situation when one pattern is a part of another
        // For example "stream" and "endstream"
        // In case when we have only "endstream" in fact "stream" will be also found at the same position
        // (position of the pattern is an index AFTER the pattern)

        result.push({
          left: leftPatterns[0],
          right: rightPatterns[0]
        });

        leftPatterns.splice(0, 1);
        rightPatterns.splice(0, 1);

        continue;
      }

      if (leftPatterns[currentPositionLeft] > rightPatterns[0]) {
        break;
      }

      while (leftPatterns[currentPositionLeft] < rightPatterns[0]) {
        currentPositionLeft++;

        if (currentPositionLeft >= leftPatterns.length) {
          break;
        }
      }

      result.push({
        left: leftPatterns[currentPositionLeft - 1],
        right: rightPatterns[0]
      });

      leftPatterns.splice(currentPositionLeft - 1, 1);
      rightPatterns.splice(0, 1);

      currentPositionLeft = 0;
    }
    //#endregion

    //#region Sort result
    result.sort((a, b) => (a.left - b.left));
    //#endregion

    return result;
  }

  /**
   * Find all paired patterns in the stream
   * @param inputLeftPatterns Array of left patterns to search for
   * @param inputRightPatterns Array of right patterns to search for
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @returns
   */
  public findPairedArrays(inputLeftPatterns: ByteStream[], inputRightPatterns: ByteStream[], start?: null | number, length?: null | number): FindPairedArraysResult[];
  public findPairedArrays(inputLeftPatterns: ByteStream[], inputRightPatterns: ByteStream[], start_?: null | number, length_?: null | number): FindPairedArraysResult[] {
    //#region Initial variables
    const { start, length } = this.prepareFindParameters(start_, length_);
    const result: FindPairedArraysResult[] = [];

    let currentPositionLeft = 0;
    //#endregion

    //#region Find all "left patterns" as sorted array
    const leftPatterns = this.findAllIn(inputLeftPatterns, start, length);
    if (leftPatterns.length == 0)
      return result;
    //#endregion

    //#region Find all "right patterns" as sorted array
    const rightPatterns = this.findAllIn(inputRightPatterns, start, length);
    if (rightPatterns.length == 0)
      return result;
    //#endregion

    //#region Combine patterns
    while (currentPositionLeft < leftPatterns.length) {
      if (rightPatterns.length == 0) {
        break;
      }

      if (leftPatterns[0].position == rightPatterns[0].position) {
        // Possible situation when one pattern is a part of another
        // For example "stream" and "endstream"
        // In case when we have only "endstream" in fact "stream" will be also found at the same position
        // (position of the pattern is an index AFTER the pattern)

        result.push({
          left: leftPatterns[0],
          right: rightPatterns[0]
        });

        leftPatterns.splice(0, 1);
        rightPatterns.splice(0, 1);

        continue;
      }

      if (leftPatterns[currentPositionLeft].position > rightPatterns[0].position) {
        break;
      }

      while (leftPatterns[currentPositionLeft].position < rightPatterns[0].position) {
        currentPositionLeft++;

        if (currentPositionLeft >= leftPatterns.length) {
          break;
        }
      }

      result.push({
        left: leftPatterns[currentPositionLeft - 1],
        right: rightPatterns[0]
      });

      leftPatterns.splice(currentPositionLeft - 1, 1);
      rightPatterns.splice(0, 1);

      currentPositionLeft = 0;
    }
    //#endregion

    //#region Sort result
    result.sort((a, b) => (a.left.position - b.left.position));
    //#endregion

    return result;
  }

  /**
   * Replace one patter with other
   * @param searchPattern The pattern to search for
   * @param replacePattern The pattern to replace initial pattern
   * @param start Start position to search from
   * @param length Length of byte block to search at
   * @param findAllResult Pre-calculated results of "findAllIn"
   */
  public replacePattern(searchPattern: ByteStream, replacePattern: ByteStream, start?: null | number, length?: null | number, findAllResult?: null | FindResult[]): ReplacePatternResult;
  public replacePattern(searchPattern: ByteStream, replacePattern: ByteStream, start_?: null | number, length_?: null | number, findAllResult: null | FindResult[] = null): ReplacePatternResult {
    // TODO Align result type for BitStream
    //#region Initial variables
    let result: FindResult[] = [];

    let i;
    const output: ReplacePatternResult = {
      status: (-1),
      searchPatternPositions: [],
      replacePatternPositions: []
    };
    const { start, length } = this.prepareFindParameters(start_, length_);
    //#endregion

    //#region Find a pattern to search for
    if (findAllResult == null) {
      result = this.findAllIn([searchPattern], start, length);
      if (result.length == 0) {
        return output;
      }
    } else {
      result = findAllResult;
    }

    output.searchPatternPositions.push(...Array.from(result, element => element.position));
    //#endregion

    //#region Variables for new buffer initialization
    const patternDifference = searchPattern.length - replacePattern.length;

    const changedBuffer = new ArrayBuffer(this.view.length - (result.length * patternDifference));
    const changedView = new Uint8Array(changedBuffer);
    //#endregion

    //#region Copy data from 0 to start
    changedView.set(new Uint8Array(this.buffer, 0, start));
    //#endregion

    //#region Replace pattern
    for (i = 0; i < result.length; i++) {
      //#region Initial variables
      const currentPosition = (i == 0) ? start : result[i - 1].position;
      //#endregion

      //#region Copy bytes other then search pattern
      changedView.set(new Uint8Array(this.buffer, currentPosition, result[i].position - searchPattern.length - currentPosition), currentPosition - i * patternDifference);
      //#endregion

      //#region Put replace pattern in a new buffer
      changedView.set(replacePattern.view, result[i].position - searchPattern.length - i * patternDifference);

      output.replacePatternPositions.push(result[i].position - searchPattern.length - i * patternDifference);
      //#endregion
    }
    //#endregion

    //#region Copy data from the end of old buffer
    i--;
    changedView.set(new Uint8Array(this.buffer, result[i].position, this.length - result[i].position), result[i].position - searchPattern.length + replacePattern.length - i * patternDifference);
    //#endregion

    //#region Re-initialize existing buffer
    this.buffer = changedBuffer;
    this.view = new Uint8Array(this.buffer);
    //#endregion

    output.status = 1;

    return output;
  }

  /**
   * Skip any pattern from input array
   * @param patterns Array with patterns which should be ommited
   * @param start=null Start position to search from
   * @param length=null Length of byte block to search at
   * @param backward=false Flag to search in backward order
   * @returns
   */
  public skipPatterns(patterns: ByteStream[], start?: null | number, length?: null | number, backward?: boolean): number;
  public skipPatterns(patterns: ByteStream[], start_?: null | number, length_?: null | number, backward_?: boolean): number {
    //#region Initial variables
    const { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);

    let result = start;
    //#endregion

    //#region Search for pattern
    for (let k = 0; k < patterns.length; k++) {
      const patternLength = patterns[k].length;
      const equalStart = (backward) ? (result - patternLength) : (result);
      let equal = true;

      for (let j = 0; j < patternLength; j++) {
        if (this.view[j + equalStart] != patterns[k].view[j]) {
          equal = false;
          break;
        }
      }

      if (equal) {
        k = (-1);

        if (backward) {
          result -= patternLength;
          if (result <= 0)
            return result;
        } else {
          result += patternLength;
          if (result >= (start + length))
            return result;
        }
      }
    }
    //#endregion

    return result;
  }

  /**
   * Skip any pattern not from input array
   * @param patterns Array with patterns which should not be ommited
   * @param start
   * @param length
   * @param backward
   * @returns
   */
  public skipNotPatterns(patterns: ByteStream[], start?: number | null, length?: number | null, backward?: boolean): number;
  public skipNotPatterns(patterns: ByteStream[], start_?: number | null, length_?: number | null, backward_?: boolean): number {
    //#region Initial variables
    const { start, length, backward } = this.prepareFindParameters(start_, length_, backward_);
    let result = (-1);
    //#endregion

    //#region Search for pattern
    for (let i = 0; i < length; i++) {
      for (let k = 0; k < patterns.length; k++) {
        const patternLength = patterns[k].length;
        const equalStart = (backward) ? (start - i - patternLength) : (start + i);
        let equal = true;

        for (let j = 0; j < patternLength; j++) {
          if (this.view[j + equalStart] != patterns[k].view[j]) {
            equal = false;
            break;
          }
        }

        if (equal) {
          result = (backward) ? (start - i) : (start + i); // Exact position of pattern found
          break;
        }
      }

      if (result != (-1)) {
        break;
      }
    }
    //#endregion

    return result;
  }

  protected prepareFindParameters(start: null | number = null, length: null | number = null, backward = false) {
    if (start === null) {
      start = (backward) ? this.length : 0;
    }

    if (start > this.length) {
      start = this.length;
    }

    if (backward) {
      if (length === null) {
        length = start;
      }

      if (length > start) {
        length = start;
      }
    } else {
      if (length === null) {
        length = this.length - start;
      }

      if (length > (this.length - start)) {
        length = this.length - start;
      }
    }

    return { start, length, backward };
  }

}