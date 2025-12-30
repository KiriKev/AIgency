declare module "react" {
    export type MouseEventHandler<T = any> = (event: any) => void;
}

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

export { };