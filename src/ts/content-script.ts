import {Definition, Usage, Token} from "./lib/_model";

console.log('Detect github.com ' + window.location.href);

let permalink = document.querySelector('.js-permalink-shortcut')!;
let urlTokens = permalink.getAttribute('href')!.split('/');

let repoName = `${urlTokens[1]}/${urlTokens[2]}`;
let revision = urlTokens[4];
let file = urlTokens.slice(5).join('/');

console.log(repoName, revision, file);

let baseUrl = window.location.href.split('/').slice(3, 7).join('/');


function makeUrl(token: Token) {
  switch (token.type) {
    case "usage":
      let usage = token as Usage;
      if (!usage.definition || !usage.definition.location) {
        return 'javascript:return false;';
      }

      if (usage.definition.module == 'Jdk') {
        return `http://localhost:9000/github/${repoName}/${revision}/jdk/${usage.definition.location.path}?p=${usage.definition.nodeId}`;
      } else if (usage.definition.module == 'Jar') {
        return `http://localhost:9000/github/${repoName}/${revision}/jar/${usage.definition.jarId}/${usage.definition.location.path}?p=${usage.definition.nodeId}`;
      } else if (usage.definition.module == 'User') {
        return `/${baseUrl}/${usage.definition.location.path}#L${usage.definition.location.start.line}`;
      } else {
        throw `Unrecognized module ${usage.definition.module}`;
      }
    case "definition":
      let definition = token as Definition;

      if (!definition.location) {
        return 'javascript:return false;';
      }

      return `http://localhost:9000/github/${repoName}/${revision}/usage/${definition.nodeId}`;

    default:
      throw `Unrecognized token type ${token.type}`;
  }
}

function highlight(unsortedTokens: Token[]) {
  if (unsortedTokens.length == 0) { return; }

  let tokens = unsortedTokens
    .filter((a) => !!a.location)
    .sort((a, b) => {
      if (!a.location) { return -1; }
      if (!b.location) { return 1; }

      if (a.location.start.line < b.location.start.line) { return -2; }
      else if (a.location.start.line > b.location.start.line) { return 2; }
      else {
        if (a.location.start.col < b.location.start.col) { return -1; }
        else if (a.location.start.col > b.location.start.col) { return 1; }
        else { return 0; }
      }
    });


  let tokenIndex = 0;
  let line = tokens[tokenIndex].location!.start.line;
  let col = 1;

  function modify(elem: Node, token: Token): Node[] {
    let s = elem.nodeValue!;
    let adjustedStart = token.location!.start.col - col;
    let adjustedEnd = token.location!.end.col - col;

    let nodes = [];

    if (adjustedStart > 0) {
      nodes.push(document.createTextNode(s.substring(0, adjustedStart)));
    }

    let anchor = document.createElement('a');
    anchor.href = makeUrl(token);
    anchor.text = s.substring(adjustedStart, adjustedEnd + 1);
    nodes.push(anchor);

    if ((adjustedEnd + 1) <= (s.length - 1)) {
      nodes.push(document.createTextNode(s.substring(adjustedEnd + 1)));
    }

    return nodes;
  }

  function runUsageIndex() {
    while (
      tokenIndex < tokens.length &&
      (
        tokens[tokenIndex].location!.start.line < line ||
        (tokens[tokenIndex].location!.start.line == line && tokens[tokenIndex].location!.start.col < col)
      )
    ) {
      tokenIndex++;
    }
  }

  function walk(elem: Node): Node[] | null {
    runUsageIndex();
    if (elem.nodeType == Node.TEXT_NODE) {
      let size = elem.nodeValue!.length;
      let newChildren = null;

      if (
        tokens[tokenIndex].location!.start.line == line &&
        tokens[tokenIndex].location!.start.col >= col &&
        tokens[tokenIndex].location!.start.col <= (col + size - 1)
      ) {
        newChildren = modify(elem, tokens[tokenIndex]);
        tokenIndex++;
      }

      col += size;

      return newChildren;
    } else {
      let childNodes: ChildNode[] = [];
      elem.childNodes.forEach((child) => childNodes.push(child));

      for (let child of childNodes) {
        let newChildNodes = walk(child);
        if (newChildNodes) {
          child.replaceWith(...newChildNodes);
        }
      }

      return null;
    }
  }

  console.log(tokens);

  while (line <= tokens[tokens.length - 1].location!.start.line) {
    console.log(line);
    col = 1;
    runUsageIndex();
    let lineElem = document.querySelector(`#LC${tokens[tokenIndex].location!.start.line}`)!;
    walk(lineElem);
    line++;
  }

}

chrome.runtime.sendMessage(
  {repoName: repoName, revision: revision, file: file},
  (resp) => {
    let usages = resp.data.usages as Usage[];
    let defs = resp.data.definitions as Definition[];
    let tokens: Token[] = [];

    usages.forEach((u) => tokens.push(u));
    defs.forEach((d) => tokens.push(d));

    highlight(tokens);
  }
);

