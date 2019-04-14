import {Definition, FileResponse, Token, Usage} from "./_model";
import {combineUsagesAndDefinitions, sortAndFilterTokens} from "./_helpers";

export class LineTokens {
  constructor(
    public line: number,
    public tokens: Token[]
  ) {}


  static build(fileResponse: FileResponse): LineTokens[] {
    let tokens = sortAndFilterTokens(combineUsagesAndDefinitions(fileResponse.usages, fileResponse.definitions));
    let lines = [];

    let currentLine: number | null = null;
    let currentTokens: Token[] = [];

    for (let token of tokens) {
      if (!token.location) { continue; }
      if (currentLine === null) { currentLine = token.location.start.line; }

      if (currentLine === token.location.start.line) {
        currentTokens.push(token);
      } else {
        lines.push(new LineTokens(currentLine, currentTokens));
        currentTokens = [token];
        currentLine = token.location.start.line;
      }
    }

    if (currentTokens.length > 0 && currentLine) {
      lines.push(new LineTokens(currentLine, currentTokens));
    }

    return lines;
  }
}

export class LineTokenizer {
  readonly repoName: string;
  readonly revision: string;
  readonly branch: string | null;
  readonly selectedNodeId: string | null;
  readonly tokens: Token[];
  readonly line: number;

  index: number = 0;
  col: number = 1;

  shouldBeHighlighted: boolean = false;

  constructor(options: {
    repoName: string;
    revision: string;
    branch: string | null;
    selectedNodeId: string | null;
    line: number;
    sortedTokens: Token[]
  }) {
    this.repoName = options.repoName;
    this.revision = options.revision;
    this.branch = options.branch;
    this.selectedNodeId = options.selectedNodeId;
    this.tokens = options.sortedTokens;
    this.line = options.line;
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
          return `/${this.repoName}/blob/${this.branch || this.revision}/${usage.definition.location.path}?p=${usage.definition.nodeId}#L${usage.definition.location.start.line}`;
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
      this.index < this.tokens.length &&
      this.tokens[this.index].location!.start.line == this.line &&
      this.tokens[this.index].location!.start.col >= elemStart &&
      this.tokens[this.index].location!.start.col <= elemEnd
      ) {
      relevantTokens.push(this.tokens[this.index]);
      this.index++;
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
      if (this.selectedNodeId && this.selectedNodeId == LineTokenizer.getRelevantNodeId(token)) {
        anchor.classList.add('codelab-highlighted');
        this.shouldBeHighlighted = true;
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

  private runIndex(): void {
    while (this.index < this.tokens.length && this.tokens[this.index].location!.start.col < this.col) {
      this.index++;
    }
  }

  private walk(elem: Node): Node[] | null {
    this.runIndex();

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

  process(elem: Node): boolean {
    this.col = 1;
    this.walk(elem);
    return this.shouldBeHighlighted;
  }
}
