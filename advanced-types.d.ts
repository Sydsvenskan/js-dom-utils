export type TypeOf$<K extends string|Node, D extends Node = HTMLElement> = (
  K extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[K]
    : (
      K extends string ? D : K
    )
);

