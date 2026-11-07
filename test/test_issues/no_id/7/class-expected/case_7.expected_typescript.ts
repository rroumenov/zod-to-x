export class File {
    name: string;
    size: number;

    constructor(data: File) {
        this.name = data.name;
        this.size = data.size;
    }
}

export class Folder {
    name: string;
    mainFile: File | null;
    readme?: File;
    files: File[];
    owner?: string;

    constructor(data: Folder) {
        this.name = data.name;
        this.mainFile = data.mainFile;
        this.readme = data.readme;
        this.files = data.files;
        this.owner = data.owner;
    }
}
