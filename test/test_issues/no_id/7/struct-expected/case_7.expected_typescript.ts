export interface File {
    name: string;
    size: number;
}

export interface Folder {
    name: string;
    mainFile: File | null;
    readme?: File;
    files: File[];
    owner?: string;
}
