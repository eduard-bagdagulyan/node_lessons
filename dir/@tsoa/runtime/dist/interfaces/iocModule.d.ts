export interface IocContainer {
    get<T>(controller: {
        prototype: T;
    }): T;
}
export declare type IocContainerFactory = (request: unknown) => IocContainer;
