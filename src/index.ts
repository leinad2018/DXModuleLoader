import { DXModuleLoader } from "./DXModuleLoader";

export function index(){
    let modLoader = new DXModuleLoader();
    modLoader.start();
}

index();
console.log("hello");