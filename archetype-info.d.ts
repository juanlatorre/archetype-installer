declare module './archetype-config.json' {
  export const archetypeConfig: {
    archetypeRepo: {
      url: string;
      commit: string;
      commitDate: string;
    };
  };
}

declare module './archetype-info.json' {
  export const archetypeInfo: {
    commit: string;
    commitDate: string;
    repoUrl: string;
  };
}
