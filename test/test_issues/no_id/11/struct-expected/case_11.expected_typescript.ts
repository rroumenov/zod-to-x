export interface UserEntity {
    id: string;
    name: string;
}

export interface Group {
    owner: UserEntity;
    members: UserEntity[];
}
