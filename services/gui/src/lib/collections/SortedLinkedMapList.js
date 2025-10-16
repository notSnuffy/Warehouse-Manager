/**
 * A node in a sorted linked list.
 * @class
 * @property {any} key - The key of the node.
 * @property {any} value - The value of the node.
 * @property {Node|null} next - The next node in the list.
 */
class Node {
  /**
   * Creates a new Node.
   * @param {any} key - The key of the node.
   * @param {any} value - The value of the node.
   */
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.next = null;
  }
}

/**
 * A sorted linked list with a map for quick access.
 * @class
 */
class SortedLinkedMapList {
  /**
   * The head of the linked list.
   * @type {Node|null}
   * @default null
   */
  #head;

  /**
   * The map for quick access to nodes by key.
   * @type {Map<any, Node>}
   * @default new Map()
   */
  #map;

  /**
   * The comparator function to determine the order of nodes.
   * @type {Function}
   * @default (a, b) => a - b
   */
  #comparator;

  /**
   * Compares two keys using the comparator function.
   * @param {any} a - The first value.
   * @param {any} b - The second value.
   * @return {boolean} - True if a is less than b, false otherwise.
   */
  #isLessThan(a, b) {
    return this.#comparator(a, b) < 0;
  }

  /**
   * Creates a new SortedLinkedMapList.
   * @param {Function} comparator - A function to compare two keys. Defaults to numerical comparison.
   */
  constructor(comparator = (a, b) => a - b) {
    this.#head = null;
    this.#map = new Map();
    this.#comparator = comparator;
  }

  /**
   * Inserts a new key-value pair into the sorted linked list.
   * If the key already exists, it updates the value and repositions the node.
   * @param {any} key - The key to insert.
   * @param {any} value - The value to insert.
   * @return {void}
   */
  insert(key, value) {
    if (this.#map.has(key)) {
      this.remove(key);
    }

    const newNode = new Node(key, value);
    this.#map.set(key, newNode);

    if (!this.#head || this.#isLessThan(value, this.#head.value)) {
      newNode.next = this.#head;
      this.#head = newNode;
      return;
    }

    let current = this.#head;
    while (current.next && this.#isLessThan(current.next.value, value)) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  /**
   * Removes a key-value pair from the sorted linked list.
   * @param {any} key - The key to remove.
   * @return {boolean} - True if the key was found and removed, false otherwise.
   */
  remove(key) {
    if (!this.#map.has(key)) {
      return false;
    }

    const nodeToRemove = this.#map.get(key);
    this.#map.delete(key);

    if (this.#head === nodeToRemove) {
      this.#head = this.#head.next;
      return true;
    }

    let current = this.#head;

    while (current.next && current.next !== nodeToRemove) {
      current = current.next;
    }

    current.next = nodeToRemove.next;
    return true;
  }

  /**
   * Updates the value of an existing key and repositions the node if necessary.
   * @param {any} key - The key to update.
   * @param {any} newValue - The new value to set.
   * @return {boolean} - True if the key was found and updated, false otherwise.
   */
  update(key, newValue) {
    if (!this.#map.has(key)) {
      return false;
    }

    if (this.#map.get(key).value === newValue) {
      return true;
    }

    this.remove(key);
    this.insert(key, newValue);
    return true;
  }

  /**
   * Retrieves the value associated with a key.
   * @param {any} key - The key to retrieve.
   * @return {any|null} - The value associated with the key, or null if not found.
   */
  get(key) {
    return this.#map.has(key) ? this.#map.get(key).value : null;
  }

  /**
   * Gets the value of the head node.
   * @return {any|null} - The value of the head node, or null if the list is empty.
   */
  getHeadValue() {
    return this.#head ? this.#head.value : null;
  }

  /**
   * Iterates over the entries in the sorted linked list.
   * @return {IterableIterator<[any, any]>} - An iterator over the [key, value] pairs.
   */
  *entries() {
    let current = this.#head;
    while (current) {
      yield [current.key, current.value];
      current = current.next;
    }
  }

  /**
   * Gets the number of elements in the sorted linked list.
   * @return {number} - The number of elements.
   */
  size() {
    return this.#map.size;
  }

  /**
   * Clears the sorted linked list.
   * @return {void}
   */
  clear() {
    this.#head = null;
    this.#map.clear();
  }

  /**
   * Checks if a key exists in the sorted linked list.
   * @param {any} key - The key to check.
   * @return {boolean} - True if the key exists, false otherwise.
   */
  has(key) {
    return this.#map.has(key);
  }
}

export default SortedLinkedMapList;
