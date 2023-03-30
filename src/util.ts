export function isEmptyObject(obj: Object) {
    for (let i in obj) {
        return false;
    }

    return true;
}
