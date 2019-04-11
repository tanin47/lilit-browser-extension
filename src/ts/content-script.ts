import {Usage} from "./lib/_model";

console.log('Detect github.com ' + window.location.href);

let permalink = document.querySelector('.js-permalink-shortcut')!;
let tokens = permalink.getAttribute('href')!.split("/");

let repoName = `${tokens[1]}/${tokens[2]}`;
let revision = tokens[4];
let file = tokens.slice(5).join('/');

function highlight(usage: Usage) {
  let line = document.querySelector(`LC${usage.location.start.line}`);

}

console.log(repoName, revision, file);
chrome.runtime.sendMessage(
  {repoName: repoName, revision: revision, file: file},
  (resp) => {
    let usages = resp.data.usages as Usage[];
    console.log(usages);

    for (let usage of usages) {
      highlight(usage);
    }
  }
);

