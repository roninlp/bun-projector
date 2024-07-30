import type { Config } from "./config";
import fs from "fs";
import path from "path";

export type Data = {
  projector: {
    [key: string]: {
      [key: string]: string;
    };
  };
};

type Value = string | undefined;

const defaultData = {
  projector: {},
};

export default class Projector {
  constructor(
    private config: Config,
    private data: Data,
  ) {}

  getValueAll(): { [key: string]: string } {
    let curr = this.config.pwd;
    let prev = "";

    let out = {};
    const paths = [];
    do {
      prev = curr;
      paths.push(curr);
      curr = path.dirname(curr);
    } while (curr !== prev);
    return paths.reverse().reduce((acc, path) => {
      const value = this.data.projector[path];
      if (value) {
        Object.assign(acc, value);
      }

      return acc;
    }, {});
  }

  getValue(key: string): Value {
    let curr = this.config.pwd;
    let prev = "";

    let out: Value;
    do {
      const value = this.data.projector[curr]?.[key];
      if (value) {
        out = value;
        break;
      }

      prev = curr;
      curr = path.dirname(curr);
    } while (curr !== prev);

    return out;
  }

  setValue(key: string, value: string) {
    let dir = this.data.projector[this.config.pwd];
    if (!dir) {
      this.data.projector[this.config.pwd] = {};
    }

    dir[key] = value;
  }

  removeValue(key: string) {
    const dir = this.data.projector[this.config.pwd];
    if (dir) {
      delete dir[key];
    }
  }

  static fromConfig(config: Config): Projector {
    if (fs.existsSync(config.config)) {
      let data: Data;
      try {
        data = JSON.parse(fs.readFileSync(config.config).toString());
      } catch (e) {
        data = defaultData;
      }
      return new Projector(config, data);
    }

    return new Projector(config, defaultData);
  }
}
