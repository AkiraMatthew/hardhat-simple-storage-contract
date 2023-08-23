"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const chai_1 = require("chai");
describe('SimpleStorage', function () {
    let SimpleStorageFactory, simpleStorage;
    beforeEach(async function () {
        SimpleStorageFactory = await hardhat_1.ethers.getContractFactory('SimpleStorage');
        simpleStorage = await SimpleStorageFactory.deploy();
    });
    it('Should start with a favorite number of 0', async () => {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = '0';
        // assert
        // expect
        chai_1.assert.equal(currentValue.toString(), expectedValue);
        (0, chai_1.expect)(currentValue.toString().to.equal(expectedValue));
    });
    it("Should update when we call 'store'", async () => {
        const expectedValue = '7';
        const transactionResponse = await simpleStorage.store(expectedValue);
        await transactionResponse.wait(1);
        const currentValue = await simpleStorage.retrieve();
        chai_1.assert.equal(currentValue.toString(), expectedValue);
    });
});
