import IModule from "IModule";

export default class DXModuleBase implements IModule {
    public isSystemModule(): boolean {
        return true;
    }

    public isPersistantModule(): boolean {
        return false;
    }

    public reqDependencies(): string[] {
        return [];
    }
}