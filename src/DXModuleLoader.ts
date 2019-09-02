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

    private async loadModules(moduleList: string[]): Promise<Map<string, any>> {
        let loadedDependencies: Map<string, any> = new Map();
        let promises: Promise<void>[] = [];
        for (let modulePath of moduleList) {
            promises.push(this.loadModule(modulePath, loadedDependencies));
        }
        await Promise.all(promises);
        return loadedDependencies;
    }

    private async loadModule(modulePath: string, loadedDependencies: Map<string, any>): Promise<void> {

        let moduleClass = (await this.importModule(modulePath)).default;
        let newModule = this.registerDependency(modulePath, moduleClass, loadedDependencies);
        if (newModule) {
            let moduleObj = this.constructModule(moduleClass);
            let subDependencies = moduleObj.reqDependencies();
            let promises: Promise<void>[] = []
            for (let sub of subDependencies) {
                promises.push(this.loadModule(sub, loadedDependencies));
            }
            await Promise.all(promises);
        }
    }

    private registerDependency(modulePath: string, moduleClass: any, loadedDependencies: Map<string, any>): boolean {
        let mod: any = loadedDependencies.get(modulePath);
        if (mod) {
            return false;
        } else {
            loadedDependencies.set(modulePath, moduleClass);
            return true;
        }
    }

    private async importModule(modulePath: string): Promise<any> {
        let moduleClass: any;
        try {
            //Try to load module from the module library
            moduleClass = await import("../module_library/" + modulePath);
        } catch (e) {
            console.log(e);
            //Module is a custom module
            moduleClass = await import("../custom_modules/" + modulePath);
        }

        return moduleClass;
    }

    private constructModule(moduleClass: any): IModule {
        return <IModule>(new moduleClass());
    }

    public async start(): Promise<void> {
        await this.PreInitialize();
        this.Initialize();
        this.PostInitialize();
    }
}