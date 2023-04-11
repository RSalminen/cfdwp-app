export interface IWidget {
    title:string,
    description:string,
    camera:object|null
}

export interface ITeacherOptions {
    restrictFields: string[] | null,
    color: string,
}

export interface ITeacherCollObj {
    id: number,
    name: number,
    date_added: string,
}

export interface ITeacherSimObj {
    id: string,
    simtitle: string,
    added_date: string,
    filetype: number,
    collection_name: number
}