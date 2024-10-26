class GlobalData {
  constructor() {
    this.dataMap = new Map();
  }

  set(name, data) {
    this.dataMap.set(name, data);
  }

  get(name) {
    return this.dataMap.get(name);
  }
}

const Global = new GlobalData();

export { Global };
