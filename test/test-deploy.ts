import { ethers } from 'hardhat';
import { expect, assert } from 'chai';
import { Contract, ContractFactory } from 'ethers';

describe('SimpleStorage', function () {
    let SimpleStorageFactory: ContractFactory, simpleStorage: Contract;

    beforeEach(async function () {
        SimpleStorageFactory = await ethers.getContractFactory('SimpleStorage');
        simpleStorage = await SimpleStorageFactory.deploy();
    });

    it('Should start with a favorite number of 0', async () => {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = '0';
        // assert
        // expect
        assert.equal(currentValue.toString(), expectedValue);
        //));
    });
    it("Should update when we call 'store'", async () => {
        const expectedValue = '7';
        const transactionResponse = await simpleStorage.store(expectedValue);
        await transactionResponse.wait(1);

        const currentValue = await simpleStorage.retrieve();
        assert.equal(currentValue.toString(), expectedValue);
    });
    // to test
    /*it('Should add a new person', async () => {
        interface People {
            person: string;
            favoriteNumber: number | string;
        }

        let people: People[] = [];
        const person = 'Akira';
        const personFavoriteNumber = 7;

        const addNewPerson = await simpleStorage.addPerson.push(
            person,
            personFavoriteNumber
        );
        assert.equal(people, addNewPerson);
    });*/
});
