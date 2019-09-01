import IModule from "IModule";

/**
 * Loads Modules from the module library and from custom modules
 */
export class DXModuleLoader {
    /**
     * Loads explicit modules and detects implicit modules
     */
    private async PreInitialize(): Promise<void> {
        let modList = this.parseXML();
        console.log(modList);
        let dependencies = this.loadModules(modList);
        console.log("Printing Dependencies");
        (await dependencies).forEach(x => console.log(x));
    }

    /**
     * Verifies module dependencies for both explicit and implicit modules
     */
    private Initialize(): void {

    }

    /**
     * Constructs system modules and injects dependencies
     */
    private PostInitialize(): void {

    }

    /**
     * Parses the mod list xml document and returns an array of module paths
     */
    private parseXML(): Array<string> {
        //TODO
        let fs = require('fs');
        let xml2js = require('xml2js');
        let parser = new xml2js.Parser({ attrkey: "ATTR" });

        let paths: string[] = [];
        let fileString = fs.readFileSync("./settings/moduleList.xml");
        parser.parseString(fileString, function (err, json) {
            if (err) {
                console.log(err);
            }
            for (let mod of json.modules.module) {
                paths.push(mod);
            }
        });

        return paths;
    }

    private async loadModules(moduleList: string[]): Promise<Set<string>> {
        let loadedDependencies: Set<string> = new Set<string>();
        let promises: Promise<void>[] = [];
        for (let modulePath of moduleList) {
            promises.push(this.loadModule(modulePath, loadedDependencies));
        }
        await Promise.all(promises);
        return loadedDependencies;
    }
    
    private async loadModule(modulePath: string, loadedDependencies: Set<string>): Promise<void>{
        loadedDependencies.add(modulePath);
        let mainModule = await this.importModule(modulePath);
        let moduleObj = this.constructModule(mainModule);
        let subDependencies = moduleObj.reqDependencies();
        let promises: Promise<void>[] = []
        for(let sub of subDependencies){
            promises.push(this.loadModule(sub, loadedDependencies));
        }
        await Promise.all(promises);
    }

    private async importModule(modulePath: string): Promise<any> {
        let moduleClass: any;
        try {
            //Try to load module from the module library
            moduleClass = await import("D:/Daniel/Documents/Github/DXModuleLoader/output/module_library/" + modulePath);
        } catch (e) {
            console.log(e);
            //Module is a custom module
            moduleClass = await import("./custom_modules/" + modulePath);
        }

        return moduleClass;
    }

    private constructModule(moduleClass: any): IModule{
        console.log(moduleClass.default);
        return <IModule>(new moduleClass.default());
    }

    public async start(): Promise<void> {
        await this.PreInitialize();
        this.Initialize();
        this.PostInitialize();
    }
}