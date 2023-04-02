export function isEmptyObject(obj: Object) {
    // noinspection LoopStatementThatDoesntLoopJS
    for (let i in obj) {
        return false;
    }

    return true;
}

// this should also be able to see if a string _could_ be a url if more text gets added
// for use in autocompletion
export function isUrl(str: string, canBePartial: boolean = false): boolean {
    /**
     * todo
     *
     * regex?
     * new URL?
     */
}
