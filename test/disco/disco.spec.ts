import { Sequelize } from "sequelize-typescript";

import { DiscoSessionManager } from "../../src/disco";

describe("DiscoSessionManager", function () {
    let mockSequelize: Sequelize;
    beforeEach(() => {
        mockSequelize = {} as Sequelize;
    });

    it("Should instantiate", function () {
        expect(new DiscoSessionManager({} as any, mockSequelize)).toBeTruthy();
    });

    it("Should initialize", async function () {
        const m = new DiscoSessionManager({} as any, mockSequelize);
        await m.initialized;
    });
});

describe("DiscoSessionManager.queuePush", function () {});
