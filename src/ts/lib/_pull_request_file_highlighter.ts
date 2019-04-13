import {LineTokenizer, LineTokens} from "./_line_tokenizer";


export class PullRequestFileTokenSet {
  lineTokensByLine: Map<number, LineTokens>;
  constructor(
    public revision: string,
    lineTokens: LineTokens[]
  ) {
   this.lineTokensByLine = new Map();

   lineTokens.forEach((lineToken) => {
     this.lineTokensByLine.set(lineToken.line, lineToken);
   });
  }
}

export class PullRequestFileHighlighter {
  fileView: Element;
  repoName: string;

  startTokenSet: PullRequestFileTokenSet;
  endTokenSet: PullRequestFileTokenSet;

  constructor(
    options: {
      repoName: string,
      fileView: Element,
      startTokenSet: PullRequestFileTokenSet,
      endTokenSet: PullRequestFileTokenSet
    }
  ) {
    this.fileView = options.fileView;
    this.repoName = options.repoName;
    this.startTokenSet = options.startTokenSet;
    this.endTokenSet = options.endTokenSet;
  }

  private processView(cell: Element, line: number, tokenSet: PullRequestFileTokenSet): void {
    let tokenizer = new LineTokenizer({
      repoName: this.repoName,
      revision: tokenSet.revision,
      branch: null,
      selectedNodeId: null,
      line: line,
      sortedTokens: tokenSet.lineTokensByLine.has(line) ? tokenSet.lineTokensByLine.get(line)!.tokens : []
    });

    tokenizer.process(cell);

  }

  run(): void {
    this.fileView.querySelectorAll('.file-diff-split tr').forEach((row) => {
      // Having 4 children looks like a diff.
      if (row.children.length == 4) {
        let startRevisionLine = row.children.item(0)!.getAttribute('data-line-number');
        if (startRevisionLine) {
          this.processView(row.children.item(1)!.querySelector('.blob-code-inner')!, parseInt(startRevisionLine), this.startTokenSet);
        }

        let endRevisionLine = row.children.item(2)!.getAttribute('data-line-number');
        console.log(endRevisionLine);
        if (endRevisionLine) {
          console.log(row.children.item(3)!.querySelector('.blob-code-inner')!);
          console.log(this.endTokenSet);
          this.processView(row.children.item(3)!.querySelector('.blob-code-inner')!, parseInt(endRevisionLine), this.endTokenSet);
        }
      }
    });
  }
}
