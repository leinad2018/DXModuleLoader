export default interface IModule {
    isSystemModule: () => boolean;
    isPersistantModule: () => boolean;
    reqDependencies: () => Array<string>;
}