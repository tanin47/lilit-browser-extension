import {LineTokenizer, LineTokens} from "./_line_tokenizer";

export class FileHighlighter {
  repoName: string;
  revision: string;
  branch: string;
  lineTokens: LineTokens[];
  selectedNodeId: string | null;

  highlightedLines: Set<number> = new Set();

  constructor(
    options: {
      repoName: string;
      revision: string;
      branch: string;
      selectedNodeId: string | null;
      lineTokens: LineTokens[];
    }
  ) {
    this.repoName = options.repoName;
    this.revision = options.revision;
    this.branch = options.branch;
    this.selectedNodeId = options.selectedNodeId;
    this.lineTokens = options.lineTokens;
  }

  run(): void {
    if (this.lineTokens.length == 0) { return; }

    for (let lineToken of this.lineTokens) {
      let tokenizer = new LineTokenizer({
        repoName: this.repoName,
        revision: this.revision,
        branch: this.branch,
        selectedNodeId: this.selectedNodeId,
        line: lineToken.line,
        sortedTokens: lineToken.tokens
      });
      let lineElem = document.querySelector(`#LC${lineToken.line}`)!;

      let shouldLineBeHighlighted = tokenizer.process(lineElem);

      if (shouldLineBeHighlighted) {
        this.highlightedLines.add(lineToken.line);
      }
    }

    this.highlightedLines.forEach((line) => {
      let lineElem = document.querySelector(`#LC${line}`)!;
      lineElem.classList.add('highlighted');
    });
  }
}


