import { Font, GlyphRun } from "fontkit";

/**
 * How can you format text in variable-width fonts into fixed-width columns?
 */

type Column = string[];

/**
 * Returns the width of string s in units when it is rendered in the given font.
 * @param s
 * @param font
 */
function calculateWidth(s: string, font: Font): any {
    return font.layout(s, font.availableFeatures).bbox.width;
}

/**
 * Should return a number in units representing the width of the widest string in the column
 * when all values are rendered in the given font.
 * @param c
 * @param font
 */
function calculateColumnWidth(c: Column, font: Font): number {
    let max = 0;
    for (const e of c) {
        max = Math.max(max, calculateWidth(e, font));
    }

    return max;
}

/**
 * Pad a string to a certain number of units using the best fit of spaces
 * @param s
 * @param font
 * @param units
 */
function padString(s: string, font: Font, units: number): string {
    const spaces = [
        [" ", font.unitsPerEm],
        [" ", font.unitsPerEm / 2],
        [" ", font.unitsPerEm / 3],
        [" ", font.unitsPerEm / 4],
        [" ", font.unitsPerEm / 6],
    ];

    const swidth = font.layout(s).bbox.width;
    let diff = units - swidth;
    if (diff < 0) return s;

    const nMuttons = Math.floor(diff / font.unitsPerEm);
    if (nMuttons) {
        s += " ".repeat(nMuttons);
        diff -= nMuttons * font.unitsPerEm;
    }

    return s;
}

/**
 * Pad a string using string 'c' such that it will be 'to' units wide in the given Font.
 * If cWidth is not provided the Font will be used to determine its width.
 * @param s
 * @param sWidth
 * @param c
 * @param to
 * @param cWidth
 * @param where
 */
function visualPad(
    s: string,
    sWidth: number,
    c: AlignmentToken,
    to: number,
    where: "start" | "end"
): [string, number] {
    if (sWidth + c.w > to) return [s, sWidth];
    const diff = to - sWidth;
    const nc = Math.floor(diff / c.w);
    const pad = c.c.repeat(nc);

    const ps = where === "start" ? pad + s : s + pad;
    return [ps, nc * c.w + sWidth];
}

interface AlignmentToken {
    c: string;
    w: number;
}

export function align(
    col: string[],
    font: Font,
    where: "start" | "end",
    to?: number
): string[] {
    let layoutMax = to ?? 0;
    const layouts: Record<string, number> = {};
    for (const el of col) {
        if (el in layouts) continue;

        const elW = (layouts[el] = font.layout(el).bbox.width);
        layoutMax = elW > layoutMax ? elW : layoutMax;
    }

    const aligners = [
        { c: " ", w: font.unitsPerEm },
        { c: " ", w: font.unitsPerEm / 2 },
        { c: " ", w: font.unitsPerEm / 3 },
        { c: " ", w: font.unitsPerEm / 4 },
        { c: " ", w: font.unitsPerEm / 6 },
        { c: " ", w: font.unitsPerEm / 8 },
    ];

    return col.map((e) => {
        let [p, w] = [e, layouts[e]];
        let i = 0;
        while (w < layoutMax && i < aligners.length) {
            [p, w] = visualPad(p, w, aligners[i], layoutMax, where);
            i++;
        }

        return p;
    });
}
