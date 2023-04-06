import { DiscoSessionManager } from "../../src/disco/disco";

describe("DiscoSessionManager", function () {
    it("Should instantiate", function () {
        expect(new DiscoSessionManager({} as any, "test.sqlite")).toBeTruthy();
    });

    it("Should initialize", async function () {
        const m = new DiscoSessionManager({} as any, "test.sqlite");
        await m.initialized;
    });
});

describe("DiscoSessionManager.queuePush", function () {

})
