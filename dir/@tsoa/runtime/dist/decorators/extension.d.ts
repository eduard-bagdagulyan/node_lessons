export declare function Extension(_name: string, _value: ExtensionType | ExtensionType[]): Function;
export declare type ExtensionType = string | {
    [name: string]: ExtensionType;
};
