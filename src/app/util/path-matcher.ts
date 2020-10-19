import {PRIMARY_OUTLET, UrlTree} from '@angular/router';

export class PathMatcher {
  private constructor(readonly language: string, readonly path: string, readonly fragment: string) {
  }

  static fromUrlTree(tree: UrlTree): PathMatcher {
    let language = null;
    let path = '';

    const primaryOutlet = tree.root.children[PRIMARY_OUTLET];
    if (primaryOutlet) {
      const segments = primaryOutlet.segments;
      if (segments.length > 0) {
        language = segments[0].path;

        for (let i = 1; i < segments.length; i++) {
          if (i > 1) {
            path += '/';
          }
          path += segments[i].path;
        }
      }
    }

    return new PathMatcher(language, path, tree.fragment);
  }

  matches(path: string, fragment: string = null): boolean {
    if (this.path !== path) {
      return false;
    }
    return this.fragment ? this.fragment === fragment : fragment == null;
  }
}
