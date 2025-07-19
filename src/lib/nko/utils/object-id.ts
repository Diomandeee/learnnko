/**
 * A lightweight implementation of MongoDB's ObjectId
 * that doesn't require the MongoDB package
 */
export class ObjectId {
  private static counter = Math.floor(Math.random() * 0xffffff);
  
  /**
   * Generates a MongoDB-compatible ObjectId string
   */
  static generate(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
    const machineId = this.randomByte(3);
    const processId = this.randomByte(2);
    const counter = (this.counter++).toString(16).padStart(6, '0');
    
    return timestamp + machineId + processId + counter;
  }
  
  /**
   * Generates random bytes as hex string
   */
  private static randomByte(size: number): string {
    const bytes = [];
    for (let i = 0; i < size; i++) {
      bytes.push(Math.floor(Math.random() * 256).toString(16).padStart(2, '0'));
    }
    return bytes.join('');
  }
  
  /**
   * Validates if a string is a valid ObjectId
   */
  static isValid(id: string): boolean {
    return /^[0-9a-f]{24}$/.test(id);
  }
}
