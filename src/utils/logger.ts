const DEBUG = false;

function execute(fn: Function): void {
    if (DEBUG) {
        fn();
    }
}

export const log = {
    info: (...args: any): void => execute(() => console.log(args)),
    error: (...args: any): void => execute(() => console.error(args)),
    warn: (...args: any): void => execute(() => console.warn(args)),
    debug: (...args: any): void => execute(() => console.debug(args)),
    trace: (...args: any): void => execute(() => console.trace(args)),
};
