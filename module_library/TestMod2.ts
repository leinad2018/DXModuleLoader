import DXModuleBase from "DXModuleBase";

export default class TestMod2 extends DXModuleBase {
    public reqDependencies(){
        return ["TestMod3"];
    }
}