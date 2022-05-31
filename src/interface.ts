export interface CloudfrontTool {
  updateDefaultRootObject: (defaultObject: string) => Promise<unknown>;
}

export interface CloudfrontToolConfig {
  key: string;
  secret: string;
  distributionId: string;
  dirRoot?: string;
  sessionToken?: string;
  patternIndex?: string | RegExp;
  tool?: CloudfrontTool;
}
