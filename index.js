import path from "path";
import fs from "fs";
import ejs from "ejs";
import url from "url";
import parser from "@babel/parser";
import traverse from "@babel/traverse";
import { transformFromAst } from "babel-core";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// console.log(__dirname)

const modulesWrapper = [];

function createAsset(filePath) {
  // console.log("wrapper", modulesWrapper);
  let tempPath = path.resolve(__dirname, filePath);
  if (modulesWrapper.indexOf(tempPath) == -1) {
    modulesWrapper.push(tempPath);
  }

  // 1. 获取文件的内容
  const source = fs.readFileSync(filePath, { encoding: "utf-8" });

  // 2. 获取依赖关系
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      // console.log("filePathBefore", filePath);
      filePath = path.resolve(__dirname, filePath);
      // console.log("filePath", filePath);
      if (modulesWrapper.indexOf(filePath) == -1) {
        modulesWrapper.push(filePath);
      }
      deps.push(node.source.value);
    },
  });

  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });

  return {
    filePath,
    code,
    deps,
  };
}

function createGraph() {
  const mainAsset = createAsset("./example/main.js");
  const queue = [mainAsset];
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve("./example", relativePath));
      // console.log("child", child);
      queue.push(child);
    });
  }

  // console.log("queue", queue);

  return queue;
}

const graph = createGraph();

function build(graph) {
  const template = fs.readFileSync("./bundle.ejs", { encoding: "utf-8" });

  const data = graph.map((asset) => {
    return {
      filePath: modulesWrapper.indexOf(asset.filePath),
      code: asset.code,
    };
  });

  // console.log("data", data);

  const code = ejs.render(template, { data });

  fs.writeFileSync("./dist/bundle.js", code);
}

build(graph);
