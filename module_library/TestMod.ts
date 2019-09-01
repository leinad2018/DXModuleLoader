import IModule from "IModule";

export default class TestMod implements IModule {
    systemModule: boolean = true;

    public reqDependencies(): string[] {
        return ["TestMod2"];
    }

    isSystemModule(){
        return true;
    }

    isPersistantModule(){
        return false;
    }
}