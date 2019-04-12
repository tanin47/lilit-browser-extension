import {Definition, Token, Usage} from "./_model";

export class Highlighter {
  repoName: string;
  revision: string;
  baseUrl: string;
  tokens: Token[];
  line: number;
  selectedNodeId: string | null;

  tokenIndex: number = 0;
  col: number = 1;
  highlightedLines: Set<number> = new Set();

  constructor(
    options: {
      repoName: string;
      revision: string;
      baseUrl: string;
      selectedNodeId: string | null;
      unsortedTokens: Token[];
    }
  ) {
    this.repoName = options.repoName;
    this.revision = options.revision;
    this.baseUrl = options.baseUrl;
    this.selectedNodeId = options.selectedNodeId;
    this.tokens = options.unsortedTokens
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

    this.line = this.tokens[this.tokenIndex].location!.start.line;
  }

  makeUrl(token: Token): string {
    switch (token.type) {
      case "usage":
        let usage = token as Usage;
        if (!usage.definition || !usage.definition.location) {
          return 'javascript:return false;';
        }

        if (usage.definition.module == 'Jdk') {
          return `http://localhost:9000/github/${this.repoName}/${this.revision}/jdk/${usage.definition.location.path}?p=${usage.definition.nodeId}`;
        } else if (usage.definition.module == 'Jar') {
          return `http://localhost:9000/github/${this.repoName}/${this.revision}/jar/${usage.definition.jarId}/${usage.definition.location.path}?p=${usage.definition.nodeId}`;
        } else if (usage.definition.module == 'User') {
          return `/${this.baseUrl}/${usage.definition.location.path}?p=${usage.definition.nodeId}#L${usage.definition.location.start.line}`;
        } else {
          throw `Unrecognized module ${usage.definition.module}`;
        }
      case "definition":
        let definition = token as Definition;

        if (!definition.location) {
          return 'javascript:return false;';
        }

        return `http://localhost:9000/github/${this.repoName}/${this.revision}/usage/${definition.nodeId}`;

      default:
        throw `Unrecognized token type ${token.type}`;
    }
  }

  static getRelevantNodeId(token: Token): string {
    let nodeId: string = '';
    switch (token.type) {
      case "usage":
        nodeId = (token as Usage).definition.nodeId;
        break;
      case "definition":
        nodeId = (token as Definition).nodeId;
        break;
    }
    return nodeId;
  }

  private modify(elem: Node): Node[] | null {
    let s = elem.nodeValue!;
    let elemStart = this.col;
    let elemEnd = this.col + s.length - 1;

    let relevantTokens = [];

    while (
      this.tokenIndex < this.tokens.length &&
      this.tokens[this.tokenIndex].location!.start.line == this.line &&
      this.tokens[this.tokenIndex].location!.start.col >= elemStart &&
      this.tokens[this.tokenIndex].location!.start.col <= elemEnd
      ) {
      relevantTokens.push(this.tokens[this.tokenIndex]);
      this.tokenIndex++;
    }

    if (!relevantTokens) { return null; }

    let nodes = [];
    let start = 0;

    relevantTokens.forEach((token) => {
      let tStart = token.location!.start.col - this.col;
      let tEnd = token.location!.end.col - this.col;

      if (start > tStart) { return; }

      if (tStart > 0) {
        nodes.push(document.createTextNode(s.substring(start, tStart)));
      }

      let anchor = document.createElement('a');
      anchor.href = this.makeUrl(token);
      anchor.classList.add('codelab-link');
      if (this.selectedNodeId && this.selectedNodeId == Highlighter.getRelevantNodeId(token)) {
        anchor.classList.add('codelab-highlighted');
        this.highlightedLines.add(this.line);
      }
      anchor.text = s.substring(tStart, tEnd + 1);
      nodes.push(anchor);

      start = tEnd + 1;
    });

    if (start <= (s.length - 1)) {
      nodes.push(document.createTextNode(s.substring(start)));
    }

    return nodes;
  }

  private runUsageIndex(): void {
    while (
      this.tokenIndex < this.tokens.length &&
      (
        this.tokens[this.tokenIndex].location!.start.line < this.line ||
        (this.tokens[this.tokenIndex].location!.start.line == this.line && this.tokens[this.tokenIndex].location!.start.col < this.col)
      )
    ) {
      this.tokenIndex++;
    }
  }

  private walk(elem: Node): Node[] | null {
    this.runUsageIndex();

    if (elem.nodeType == Node.TEXT_NODE) {
      let size = elem.nodeValue!.length;
      let newChildren = this.modify(elem);
      this.col += size;

      return newChildren;
    } else {
      let childNodes: ChildNode[] = [];
      elem.childNodes.forEach((child) => childNodes.push(child));

      for (let child of childNodes) {
        let newChildNodes = this.walk(child);
        if (newChildNodes) {
          child.replaceWith(...newChildNodes);
        }
      }

      return null;
    }
  }


  run(): void {
    if (this.tokens.length == 0) { return; }

    while (this.line <= this.tokens[this.tokens.length - 1].location!.start.line) {
      this.col = 1;
      this.runUsageIndex();
      let lineElem = document.querySelector(`#LC${this.tokens[this.tokenIndex].location!.start.line}`)!;
      this.walk(lineElem);
      this.line++;
    }

    this.highlightedLines.forEach((line) => {
      let lineElem = document.querySelector(`#LC${line}`)!;
      lineElem.classList.add('highlighted');
    });
  }
}


