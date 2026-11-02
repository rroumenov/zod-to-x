export class UserEntity {
    id: string;
    name: string;

    constructor(data: UserEntity) {
        this.id = data.id;
        this.name = data.name;
    }
}

export class Group {
    owner: UserEntity;
    members: UserEntity[];

    constructor(data: Group) {
        this.owner = data.owner;
        this.members = data.members;
    }
}
