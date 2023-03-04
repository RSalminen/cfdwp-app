export interface IWidget {
    title:string,
    description:string,
    camera:object|null
}

export interface ITeacherOptions {
    restrictFields: string[] | null,
    color: string,
}