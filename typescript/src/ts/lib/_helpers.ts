import {Definition, Token, Usage} from "./_model";


export function sortAndFilterTokens(unsortedTokens: Token[]): Token[] {
  return unsortedTokens
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
}

export function combineUsagesAndDefinitions(usages: Usage[], definitions: Definition[]): Token[] {
  let tokens: Token[] = [];

  usages.forEach((u) => tokens.push(u));
  definitions.forEach((d) => tokens.push(d));

  return tokens;
}