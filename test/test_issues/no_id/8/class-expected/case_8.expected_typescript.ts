export class Settings {
    name: string;
    retries: number;
    enabled: boolean;
    tags: string[];
    nickname: string;
    port: number;
    title: string;
    extra: any;

    constructor(data: Settings) {
        this.name = data.name;
        this.retries = data.retries;
        this.enabled = data.enabled;
        this.tags = data.tags;
        this.nickname = data.nickname;
        this.port = data.port;
        this.title = data.title;
        this.extra = data.extra;
    }
}
