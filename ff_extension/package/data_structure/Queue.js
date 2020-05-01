import Node from './Node';

class Queue {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  enqueue(val) {
    const node = new Node(val);
    if (this.tail === null) {
      this.head = node;
      this.tail = node;
    } else {
      this.head.next = node;
      this.head = node;
    }
  }

  dequeue() {
    if (!this.head) return null;
    const temp = this.head;
    this.head = temp.next;
    return temp;
  }
}


module.exports = Queue;