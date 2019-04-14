import {PullRequestFileHighlighter, PullRequestFileTokenSet} from "./_pull_request_file_highlighter";
import {FileResponse} from "./_model";
import {LineTokens} from "./_line_tokenizer";

declare let __HOST__: string;

export class PullRequestView {
  repoName: string;
  startRevision: string;
  endRevision: string;

  view: Element;

  observer: any;

  constructor(options: {
    repoName: string;
    startRevision: string;
    endRevision: string;
    view: Element;
  }) {
    this.repoName = options.repoName;
    this.startRevision = options.startRevision;
    this.endRevision = options.endRevision;
    this.view = options.view;

    let MutationObserver = (<any>window).MutationObserver || (<any>window).WebKitMutationObserver;

    this.observer = new MutationObserver((mutations: any, observer: any) => {
      console.log('#files is mutated. Reprocessing.', mutations);

      this.run();
    });

    this.observer.observe(this.view, {
      childList: true,
      subtree: false,
      attributes: false,
      characterData: false
    });

    this.run();
  }

  static buildData(files: FileResponse[]): Map<String, Map<String, FileResponse>> {
    let map = new Map();

    files.forEach((file) => {
      if (!map.has(file.revision)) {
        map.set(file.revision, new Map());
      }

      let revisionMap = map.get(file.revision);
      revisionMap.set(file.path, file);
    });

    return map;
  }

  private run(): void {
    // Github might put .js-diff-progressive-container in another .js-diff-progressive-container.
    // We retry registering observer just to be sure.
    this.view.querySelectorAll('.js-diff-progressive-container').forEach((elem) => {
      if (!elem.getAttribute('data-codelab-monitored')) {
        this.observer.observe(elem, {
          childList: true,
          subtree: false,
          attributes: false,
          characterData: false
        });
      }
      elem.setAttribute('data-codelab-monitored', 'true');
    });

    let fileViews: Element[] = [];

    let files: object[] = [];
    this.view.querySelectorAll('.js-file').forEach((fileView) => {
      if (!fileView.getAttribute('data-codelab-processed')) {
        let path = fileView.querySelector('.js-file-header')!.getAttribute('data-path')!;

        if (path.endsWith('.java')) {
          files.push({revision: this.startRevision, path: path});
          files.push({revision: this.endRevision, path: path});

          fileViews.push(fileView);
        }
      }

      fileView.setAttribute('data-codelab-processed', 'true');
    });

    if (files.length == 0) { return; }

    console.log(`[Codelab] Fetch data from ${__HOST__} for `, files);
    chrome.runtime.sendMessage(
      {
        repoName: this.repoName,
        files: files
      },
      (resp) => {
        if (resp.data && resp.data.success) {
          console.log('[Codelab] Fetched data successfully ', resp);

          let dataByRevisionAndPath = PullRequestView.buildData(resp.data.files);

          fileViews.forEach((fileView) => {
            let path = fileView.querySelector('.js-file-header')!.getAttribute('data-path')!;
            let startFileResponse = dataByRevisionAndPath.get(this.startRevision)!.get(path)!;
            let endFileResponse = dataByRevisionAndPath.get(this.endRevision)!.get(path)!;

            new PullRequestFileHighlighter({
              repoName: this.repoName,
              fileView: fileView,
              startTokenSet: new PullRequestFileTokenSet(
                this.startRevision,
                LineTokens.build(startFileResponse)
              ),
              endTokenSet: new PullRequestFileTokenSet(
                this.endRevision,
                LineTokens.build(endFileResponse)
              )
            });
          });
        } else {
          console.log('[Codelab] Failed to fetch data.', resp);
        }
      }
    );
  }
}