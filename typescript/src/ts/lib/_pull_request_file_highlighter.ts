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

  observer: any;

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

    let MutationObserver = (<any>window).MutationObserver || (<any>window).WebKitMutationObserver;

    this.observer = new MutationObserver((mutations: any, observer: any) => {
      console.log(this.fileView.id, mutations, 'is mutated. Reprocessing.');
      this.run();
    });

    this.observer.observe(this.fileView.querySelector('table tbody'), {
      childList: true,
      attributes: false,
      characterData: false,
      subtree: false,
    });

    this.run();
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

  private run(): void {
    this.fileView.querySelectorAll('.file-diff-split tr').forEach((row) => {
      // Having 4 children looks like a diff.
      if (row.children.length == 4 && !row.getAttribute('data-codelab-processed')) {
        let startRevisionLine = row.children.item(0)!.getAttribute('data-line-number');
        if (startRevisionLine) {
          let lineElem = row.children.item(1)!;
          if (!lineElem.classList.contains('blob-code-inner')) {
            lineElem = lineElem.querySelector('.blob-code-inner')!;
          }
          this.processView(lineElem, parseInt(startRevisionLine), this.startTokenSet);
        }

        let endRevisionLine = row.children.item(2)!.getAttribute('data-line-number');
        if (endRevisionLine) {
          let lineElem = row.children.item(3)!;
          if (!lineElem.classList.contains('blob-code-inner')) {
            lineElem = lineElem.querySelector('.blob-code-inner')!;
          }
          this.processView(lineElem, parseInt(endRevisionLine), this.endTokenSet);
        }
      }

      row.setAttribute('data-codelab-processed', 'true');
    });
  }
}
